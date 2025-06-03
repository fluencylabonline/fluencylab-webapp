// src/lib/pseudocode/validator.ts

/**
 * Validador para Pseudocódigo Cambridge
 * 
 * Este módulo implementa um validador completo para o pseudocódigo Cambridge,
 * verificando a aderência às convenções e regras de estilo.
 */

import { Lexer, Token, TokenType } from './lexer';
import { Parser } from './parser';
import { SyntaxError } from './types';

// Interface para erros de validação
export interface ValidationError {
  lineNumber: number;
  column?: number;
  message: string;
  rule?: string;
}

// Define palavras-chave conhecidas do Cambridge (devem estar em maiúsculas)
const CAMBRIDGE_KEYWORDS = new Set([
  "DECLARE", "INTEGER", "REAL", "CHAR", "STRING", "BOOLEAN", "DATE",
  "CONSTANT", "ARRAY", "OF", "TYPE", "ENDTYPE",
  "IF", "THEN", "ELSE", "ENDIF",
  "CASE", "OF", "OTHERWISE", "ENDCASE",
  "FOR", "TO", "STEP", "NEXT",
  "WHILE", "ENDWHILE",
  "REPEAT", "UNTIL",
  "PROCEDURE", "ENDPROCEDURE", "BYVAL", "BYREF", "CALL",
  "FUNCTION", "RETURNS", "ENDFUNCTION", "RETURN",
  "INPUT", "OUTPUT",
  "OPENFILE", "READFILE", "WRITEFILE", "CLOSEFILE", "EOF",
  "DIV", "MOD", "AND", "OR", "NOT", "TRUE", "FALSE",
  // Funções built-in também tratadas como palavras-chave para maiúsculas
  "LENGTH", "MID", "RIGHT", "LCASE", "UCASE", "INT", "RAND"
]);

// Expressões regulares básicas
const identifierRegex = /^[a-zA-Z][a-zA-Z0-9]*$/; // Começa com letra, depois letras/números
const keywordRegex = /^[A-Z_]+$/; // Todas letras maiúsculas e underscore (para palavras-chave)
const assignmentOperator = "←";
const commentMarker = "//";

/**
 * Valida uma linha de pseudocódigo com base nas regras Cambridge.
 * Este é um validador simplificado focado em linhas individuais e verificações básicas de tokens.
 * Um parser completo seria necessário para validação estrutural completa.
 *
 * @param line O texto da linha de pseudocódigo.
 * @param lineNumber O número da linha (base 1).
 * @returns Um array de objetos ValidationError para a linha.
 */
function validateLine(line: string, lineNumber: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmedLine = line.trim();

  // Ignora linhas vazias e comentários
  if (trimmedLine === "" || trimmedLine.startsWith(commentMarker)) {
    return errors;
  }

  // Divide a linha em tokens (divisão simples por espaço, precisa de refinamento para operadores, strings etc.)
  const tokens = trimmedLine.split(/\s+|(?=[=<>+\-*/&(),:^.\[\]])|(?<=[=<>+\-*/&(),:^.\[\]])/).filter(token => token !== '');

  tokens.forEach((token, index) => {
    // Verifica Maiúsculas de Palavras-chave
    if (CAMBRIDGE_KEYWORDS.has(token.toUpperCase())) {
      if (token !== token.toUpperCase()) {
        errors.push({
          lineNumber,
          message: `Palavra-chave '${token}' deve estar em MAIÚSCULAS.`,
          rule: "Case - Keywords"
        });
      }
    } 
    // Verifica Maiúsculas/Formato de Identificadores (verificação básica)
    // Isso precisa de contexto: é uma variável, nome de função, etc.?
    // Uma verificação simples: se não for uma palavra-chave, número, operador ou literal de string, assume que é um identificador.
    else if (!/^\d+(\.\d+)?$/.test(token) && // Não é um número
             !/^[\"\'].*[\"\']$/.test(token) && // Não é um literal de string
             !/^[=<>+\-*/&(),:^.\[\]←]$/.test(token) && // Não é um operador/símbolo simples
             !identifierRegex.test(token)) { // Não corresponde ao padrão básico de identificador
        // Esta verificação é fraca. Um parser adequado é necessário para identificar identificadores corretamente.
        // Sinalizamos apenas se *não* parecer um identificador PascalCase/MixedCase
        errors.push({
          lineNumber,
          message: `Identificador '${token}' deve seguir a convenção MixedCase/PascalCase e começar com uma letra.`,
          rule: "Case - Identifiers"
        });
    }

    // Verifica Operador de Atribuição
    if (index > 0 && token === "=") {
        // Verifica se é parte de >=, <=, <> ou := (atribuição em alguns dialetos, mas Cambridge usa ←)
        const prevToken = tokens[index-1];
        if (![">", "<", ":"].includes(prevToken) && tokens[index+1] !== "=") { // Verifica se não é >=, <=, == ou :=
             // Pode ser atribuição, sinaliza. Precisa de contexto.
             errors.push({ 
               lineNumber, 
               message: `Atribuição deve usar '${assignmentOperator}', não '='.`,
               rule: "Assignment"
             });
        }
    }
    if (token === ":=" ) { // Explicitamente proíbe := para atribuição
         errors.push({ 
           lineNumber, 
           message: `Atribuição deve usar '${assignmentOperator}', não ':='.`,
           rule: "Assignment"
         });
    }
  });

  // Verifica o uso de = em vez de ← em contextos potenciais de atribuição (verificação simples)
  // Procura padrões como IDENTIFIER = VALUE
  if (tokens.length >= 3 && identifierRegex.test(tokens[0]) && tokens[1] === '=' && tokens[2] !== '=') {
      const prevToken = tokens[0];
      // Verifica se é parte de >=, <=, <> ou := (atribuição em alguns dialetos, mas Cambridge usa ←)
      if (![">", "<", ":"].includes(prevToken)) { // Verifica se não é >=, <=, == ou :=
           errors.push({ 
             lineNumber, 
             message: `Atribuição deve usar '${assignmentOperator}', não '='. Encontrada atribuição potencial para '${tokens[0]}'.`,
             rule: "Assignment"
           });
      }
  }

  return errors;
}

/**
 * Valida a estrutura do pseudocódigo, verificando correspondência de blocos.
 * 
 * @param code O código completo de pseudocódigo.
 * @returns Um array de erros de validação estrutural.
 */
function validateStructure(code: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const lines = code.split('\n');
  
  // Pilhas para rastrear estruturas de controle
  const ifStack: number[] = [];
  const caseStack: number[] = [];
  const forStack: { line: number, variable: string }[] = [];
  const whileStack: number[] = [];
  const repeatStack: number[] = [];
  const procedureStack: number[] = [];
  const functionStack: number[] = [];
  const typeStack: number[] = [];
  
  // Analisa cada linha
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();
    
    // Ignora linhas vazias e comentários
    if (trimmedLine === "" || trimmedLine.startsWith(commentMarker)) {
      return;
    }
    
    // Divide a linha em tokens para análise
    const tokens = trimmedLine.split(/\s+/);
    const firstToken = tokens[0].toUpperCase();
    
    // Verifica estruturas de controle
    switch (firstToken) {
      case "IF":
        ifStack.push(lineNumber);
        break;
        
      case "ENDIF":
        if (ifStack.length === 0) {
          errors.push({
            lineNumber,
            message: "ENDIF sem IF correspondente.",
            rule: "Structure - IF"
          });
        } else {
          ifStack.pop();
        }
        break;
        
      case "CASE":
        caseStack.push(lineNumber);
        break;
        
      case "ENDCASE":
        if (caseStack.length === 0) {
          errors.push({
            lineNumber,
            message: "ENDCASE sem CASE correspondente.",
            rule: "Structure - CASE"
          });
        } else {
          caseStack.pop();
        }
        break;
        
      case "FOR":
        // Extrai o nome da variável
        if (tokens.length > 1) {
          forStack.push({ line: lineNumber, variable: tokens[1] });
        } else {
          forStack.push({ line: lineNumber, variable: "" });
        }
        break;
        
      case "NEXT":
        if (forStack.length === 0) {
          errors.push({
            lineNumber,
            message: "NEXT sem FOR correspondente.",
            rule: "Structure - FOR"
          });
        } else {
          const forInfo = forStack.pop();
          // Verifica se o nome da variável corresponde
          if (tokens.length > 1 && forInfo && forInfo.variable !== "" && tokens[1] !== forInfo.variable) {
            errors.push({
              lineNumber,
              message: `NEXT ${tokens[1]} não corresponde ao FOR ${forInfo.variable} na linha ${forInfo.line}.`,
              rule: "Structure - FOR"
            });
          }
        }
        break;
        
      case "WHILE":
        whileStack.push(lineNumber);
        break;
        
      case "ENDWHILE":
        if (whileStack.length === 0) {
          errors.push({
            lineNumber,
            message: "ENDWHILE sem WHILE correspondente.",
            rule: "Structure - WHILE"
          });
        } else {
          whileStack.pop();
        }
        break;
        
      case "REPEAT":
        repeatStack.push(lineNumber);
        break;
        
      case "UNTIL":
        if (repeatStack.length === 0) {
          errors.push({
            lineNumber,
            message: "UNTIL sem REPEAT correspondente.",
            rule: "Structure - REPEAT"
          });
        } else {
          repeatStack.pop();
        }
        break;
        
      case "PROCEDURE":
        procedureStack.push(lineNumber);
        break;
        
      case "ENDPROCEDURE":
        if (procedureStack.length === 0) {
          errors.push({
            lineNumber,
            message: "ENDPROCEDURE sem PROCEDURE correspondente.",
            rule: "Structure - PROCEDURE"
          });
        } else {
          procedureStack.pop();
        }
        break;
        
      case "FUNCTION":
        functionStack.push(lineNumber);
        break;
        
      case "ENDFUNCTION":
        if (functionStack.length === 0) {
          errors.push({
            lineNumber,
            message: "ENDFUNCTION sem FUNCTION correspondente.",
            rule: "Structure - FUNCTION"
          });
        } else {
          functionStack.pop();
        }
        break;
        
      case "TYPE":
        typeStack.push(lineNumber);
        break;
        
      case "ENDTYPE":
        if (typeStack.length === 0) {
          errors.push({
            lineNumber,
            message: "ENDTYPE sem TYPE correspondente.",
            rule: "Structure - TYPE"
          });
        } else {
          typeStack.pop();
        }
        break;
    }
  });
  
  // Verifica estruturas não fechadas
  if (ifStack.length > 0) {
    ifStack.forEach(line => {
      errors.push({
        lineNumber: line,
        message: "IF sem ENDIF correspondente.",
        rule: "Structure - IF"
      });
    });
  }
  
  if (caseStack.length > 0) {
    caseStack.forEach(line => {
      errors.push({
        lineNumber: line,
        message: "CASE sem ENDCASE correspondente.",
        rule: "Structure - CASE"
      });
    });
  }
  
  if (forStack.length > 0) {
    forStack.forEach(info => {
      errors.push({
        lineNumber: info.line,
        message: `FOR ${info.variable} sem NEXT correspondente.`,
        rule: "Structure - FOR"
      });
    });
  }
  
  if (whileStack.length > 0) {
    whileStack.forEach(line => {
      errors.push({
        lineNumber: line,
        message: "WHILE sem ENDWHILE correspondente.",
        rule: "Structure - WHILE"
      });
    });
  }
  
  if (repeatStack.length > 0) {
    repeatStack.forEach(line => {
      errors.push({
        lineNumber: line,
        message: "REPEAT sem UNTIL correspondente.",
        rule: "Structure - REPEAT"
      });
    });
  }
  
  if (procedureStack.length > 0) {
    procedureStack.forEach(line => {
      errors.push({
        lineNumber: line,
        message: "PROCEDURE sem ENDPROCEDURE correspondente.",
        rule: "Structure - PROCEDURE"
      });
    });
  }
  
  if (functionStack.length > 0) {
    functionStack.forEach(line => {
      errors.push({
        lineNumber: line,
        message: "FUNCTION sem ENDFUNCTION correspondente.",
        rule: "Structure - FUNCTION"
      });
    });
  }
  
  if (typeStack.length > 0) {
    typeStack.forEach(line => {
      errors.push({
        lineNumber: line,
        message: "TYPE sem ENDTYPE correspondente.",
        rule: "Structure - TYPE"
      });
    });
  }
  
  return errors;
}

/**
 * Valida o pseudocódigo completo.
 *
 * @param code A string contendo o pseudocódigo.
 * @returns Um array de todos os erros de validação encontrados.
 */
export function validatePseudocode(code: string): ValidationError[] {
  const lines = code.split('\n');
  let allErrors: ValidationError[] = [];

  // Valida cada linha individualmente
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const lineErrors = validateLine(line, lineNumber);
    allErrors = allErrors.concat(lineErrors);
  });

  // Valida a estrutura geral
  const structuralErrors = validateStructure(code);
  allErrors = allErrors.concat(structuralErrors);

  // Valida a sintaxe usando o parser
  try {
    const lexer = new Lexer(code);
    const parser = new Parser(lexer);
    const { program, errors } = parser.parse();
    
    // Adiciona erros de sintaxe
    const syntaxErrors: ValidationError[] = errors.map(error => ({
      lineNumber: error.lineNumber,
      column: error.column,
      message: error.message,
      rule: "Syntax"
    }));
    
    allErrors = allErrors.concat(syntaxErrors);
  } catch (error) {
    // Ignora erros do parser, pois já estamos capturando-os acima
  }

  return allErrors;
}
