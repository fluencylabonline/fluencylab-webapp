// src/lib/pseudocode/interpreter.ts

/**
 * Interpretador para Pseudocódigo Cambridge
 * 
 * Este módulo implementa um interpretador completo para o pseudocódigo Cambridge,
 * executando a árvore sintática abstrata (AST) gerada pelo parser.
 */

import { Lexer } from './lexer';
import { Parser } from './parser';
import {
  AstNode, ProgramNode, StatementNode, ExpressionNode,
  VariableDeclarationNode, AssignmentNode, IfStatementNode,
  CaseStatementNode, CaseClauseNode, ForLoopNode, WhileLoopNode,
  RepeatLoopNode, InputNode, OutputNode, ProcedureDefinitionNode,
  FunctionDefinitionNode, ParameterNode, ProcedureCallNode, ReturnNode,
  DataTypeNode, ArrayTypeNode, ArrayDimensionNode, RecordTypeIdentifierNode,
  RecordTypeDefinitionNode, RecordFieldNode, FileOperationNode, EOFCheckNode,
  IdentifierNode, LiteralNode, BinaryExpressionNode, UnaryExpressionNode,
  ArrayAccessNode, RecordAccessNode, CallExpressionNode,
  InterpreterState, InterpreterError, InterpretResult, SymbolInfo,
  CallFrame, OpenFile
} from './types';

// Classe para tabela de símbolos
class SymbolTable {
  private symbols: Map<string, SymbolInfo> = new Map();
  private typeDefinitions: Map<string, RecordTypeDefinitionNode> = new Map();
  private parentScope: SymbolTable | null;

  constructor(parent: SymbolTable | null = null) {
    this.parentScope = parent;
  }

  // Declara um tipo de registro
  declareType(name: string, definition: RecordTypeDefinitionNode, lineNumber: number): void {
    if (this.lookupType(name, true) !== undefined) {
      throw new Error(`Erro de Execução (Linha ${lineNumber}): Tipo '${name}' já definido neste escopo.`);
    }
    this.typeDefinitions.set(name, definition);
  }

  // Busca um tipo de registro
  lookupType(name: string, localOnly: boolean = false): RecordTypeDefinitionNode | undefined {
    let current: SymbolTable | null = this;
    while (current) {
      const definition = current.typeDefinitions.get(name);
      if (definition) {
        return definition;
      }
      if (localOnly) break;
      current = current.parentScope;
    }
    return undefined;
  }

  // Declara uma variável ou constante
  declare(name: string, typeNode: AstNode, isConstant: boolean = false, lineNumber: number = 0, isParamByRef: boolean = false, refTarget?: { scope: SymbolTable; name: string }): void {
    if (this.symbols.has(name)) {
      throw new Error(`Erro de Execução (Linha ${lineNumber}): Identificador '${name}' já declarado neste escopo.`);
    }

    let value: any = null;
    let symbolInfo: Partial<SymbolInfo> = { type: typeNode, isConstant, isParamByRef, refTarget };

    if (!isParamByRef) {
      if (typeNode.type === "DataType") {
        const basicType = (typeNode as DataTypeNode).name;
        switch (basicType) {
          case "INTEGER": value = 0; break;
          case "REAL": value = 0.0; break;
          case "STRING": value = ""; break;
          case "CHAR": value = " "; break;
          case "BOOLEAN": value = false; break;
          case "FILE": value = null; break;
          default: value = null;
        }
      } else if (typeNode.type === "ArrayType") {
        const arrayType = typeNode as ArrayTypeNode;
        const dimensions = arrayType.dimensions;
        
        // Cria um array com as dimensões especificadas
        if (dimensions.length === 1) {
          // Array unidimensional
          const dim = dimensions[0];
          const lowerBound = evaluateConstantExpression(dim.lowerBound);
          const upperBound = evaluateConstantExpression(dim.upperBound);
          const size = upperBound - lowerBound + 1;
          
          value = new Array(size).fill(null);
        } else if (dimensions.length === 2) {
          // Array bidimensional
          const dim1 = dimensions[0];
          const dim2 = dimensions[1];
          const lowerBound1 = evaluateConstantExpression(dim1.lowerBound);
          const upperBound1 = evaluateConstantExpression(dim1.upperBound);
          const lowerBound2 = evaluateConstantExpression(dim2.lowerBound);
          const upperBound2 = evaluateConstantExpression(dim2.upperBound);
          const size1 = upperBound1 - lowerBound1 + 1;
          const size2 = upperBound2 - lowerBound2 + 1;
          
          value = Array.from({ length: size1 }, () => new Array(size2).fill(null));
        } else {
          throw new Error(`Erro de Execução (Linha ${lineNumber}): Arrays com mais de 2 dimensões não são suportados.`);
        }
      } else if (typeNode.type === "RecordTypeIdentifier") {
        // Cria um objeto vazio para o registro
        value = {};
      } else {
        value = null;
      }
    }

    this.symbols.set(name, { ...symbolInfo, value } as SymbolInfo);
  }

  // Atribui um valor a uma variável
  assign(lvalueNode: ExpressionNode, value: any, state: InterpreterState, lineNumber: number = 0): void {
    if (lvalueNode.type === "Identifier") {
      const name = (lvalueNode as IdentifierNode).name;
      const symbol = this.lookup(name, lineNumber, true);
      if (!symbol) return;

      if (symbol.isConstant) {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Não é possível atribuir valor à constante '${name}'`);
      }

      if (symbol.isParamByRef && symbol.refTarget) {
        symbol.refTarget.scope.assign({ type: "Identifier", name: symbol.refTarget.name, lineNumber }, value, state, lineNumber);
        return;
      }

      // Verifica compatibilidade de tipos
      this.checkTypeCompatibility(symbol.type, value, lineNumber);
      
      symbol.value = value;
      this.updateSymbolInScope(name, symbol);
    } else if (lvalueNode.type === "ArrayAccess") {
      const access = lvalueNode as ArrayAccessNode;
      const array = evaluateExpression(access.arrayExpr, state);
      
      if (!Array.isArray(array)) {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Não é possível aplicar acesso de índice [...] a um tipo não-array.`);
      }
      
      if (access.indices.length === 1) {
        // Array unidimensional
        const index = evaluateExpression(access.indices[0], state);
        
        // Verifica limites do array
        if (index < 0 || index >= array.length) {
          throw new Error(`Erro de Execução (Linha ${lineNumber}): Índice de array fora dos limites.`);
        }
        
        array[index] = value;
      } else if (access.indices.length === 2 && Array.isArray(array[0])) {
        // Array bidimensional
        const index1 = evaluateExpression(access.indices[0], state);
        const index2 = evaluateExpression(access.indices[1], state);
        
        // Verifica limites do array
        if (index1 < 0 || index1 >= array.length || index2 < 0 || index2 >= array[0].length) {
          throw new Error(`Erro de Execução (Linha ${lineNumber}): Índice de array fora dos limites.`);
        }
        
        array[index1][index2] = value;
      } else {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Número de índices incompatível com a dimensão do array.`);
      }
    } else if (lvalueNode.type === "RecordAccess") {
      const access = lvalueNode as RecordAccessNode;
      const record = evaluateExpression(access.recordExpr, state);
      
      if (typeof record !== "object" || record === null || Array.isArray(record)) {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Não é possível aplicar acesso de campo "." a um tipo não-registro.`);
      }
      
      const fieldName = access.fieldName;
      
      if (!record.hasOwnProperty(fieldName)) {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Registro não possui o campo '${fieldName}'`);
      }
      
      record[fieldName] = value;
    } else {
      throw new Error(`Erro de Execução (Linha ${lineNumber}): Alvo inválido para atribuição.`);
    }
  }

  // Verifica compatibilidade de tipos
  private checkTypeCompatibility(typeNode: AstNode, value: any, lineNumber: number): void {
    if (typeNode.type === "DataType") {
      const dataType = (typeNode as DataTypeNode).name;
      
      switch (dataType) {
        case "INTEGER":
          if (typeof value !== "number" || !Number.isInteger(value)) {
            throw new Error(`Erro de Execução (Linha ${lineNumber}): Valor incompatível com o tipo INTEGER.`);
          }
          break;
        case "REAL":
          if (typeof value !== "number") {
            throw new Error(`Erro de Execução (Linha ${lineNumber}): Valor incompatível com o tipo REAL.`);
          }
          break;
        case "STRING":
          if (typeof value !== "string") {
            throw new Error(`Erro de Execução (Linha ${lineNumber}): Valor incompatível com o tipo STRING.`);
          }
          break;
        case "CHAR":
          if (typeof value !== "string" || value.length !== 1) {
            throw new Error(`Erro de Execução (Linha ${lineNumber}): Valor incompatível com o tipo CHAR.`);
          }
          break;
        case "BOOLEAN":
          if (typeof value !== "boolean") {
            throw new Error(`Erro de Execução (Linha ${lineNumber}): Valor incompatível com o tipo BOOLEAN.`);
          }
          break;
      }
    }
    // Para outros tipos (array, record), a verificação é mais complexa e seria implementada aqui
  }

  // Atualiza um símbolo no escopo apropriado
  private updateSymbolInScope(name: string, symbol: SymbolInfo): void {
    let current: SymbolTable | null = this;
    while (current) {
      if (current.symbols.has(name)) {
        current.symbols.set(name, symbol);
        return;
      }
      current = current.parentScope;
    }
    throw new Error(`Erro Interno: Falha ao encontrar escopo para atualizar símbolo '${name}'`);
  }

  // Busca um símbolo na tabela
  lookup(name: string, lineNumber: number = 0, throwIfNotFound: boolean = false): SymbolInfo | undefined {
    let current: SymbolTable | null = this;
    while (current) {
      const symbol = current.symbols.get(name);
      if (symbol) {
        return symbol;
      }
      current = current.parentScope;
    }
    if (throwIfNotFound) {
      throw new Error(`Erro de Execução (Linha ${lineNumber}): Identificador '${name}' não declarado.`);
    }
    return undefined;
  }

  // Declara um procedimento ou função
  declareSubroutine(name: string, definition: ProcedureDefinitionNode | FunctionDefinitionNode, lineNumber: number): void {
    if (this.symbols.has(name)) {
      throw new Error(`Erro de Execução (Linha ${lineNumber}): Identificador '${name}' já declarado neste escopo.`);
    }
    
    const typeNode: AstNode = definition.type === "ProcedureDefinition" 
      ? { type: "ProcedureDefinition", lineNumber } 
      : { type: "FunctionDefinition", lineNumber };
    
    const symbolInfo: SymbolInfo = {
      type: typeNode,
      value: null,
      procedureDefinition: definition.type === "ProcedureDefinition" ? definition as ProcedureDefinitionNode : undefined,
      functionDefinition: definition.type === "FunctionDefinition" ? definition as FunctionDefinitionNode : undefined
    };
    
    this.symbols.set(name, symbolInfo);
  }

  // Busca um procedimento ou função
  lookupSubroutine(name: string, lineNumber: number): ProcedureDefinitionNode | FunctionDefinitionNode | undefined {
    const symbol = this.lookup(name, lineNumber);
    if (!symbol) return undefined;
    return symbol.procedureDefinition || symbol.functionDefinition;
  }
}

// Avalia uma expressão constante (para inicialização de arrays)
function evaluateConstantExpression(expr: ExpressionNode): number {
  if (expr.type === "Literal") {
    const literal = expr as LiteralNode;
    if (literal.dataType === "INTEGER" || literal.dataType === "REAL") {
      return Number(literal.value);
    }
  }
  
  // Para simplificar, assumimos que expressões constantes são apenas literais numéricos
  // Em uma implementação completa, avaliaria expressões mais complexas
  throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Expressão não é um valor constante numérico.`);
}

// Avalia uma expressão no contexto atual
function evaluateExpression(expr: ExpressionNode, state: InterpreterState): any {
  switch (expr.type) {
    case "Literal":
      return (expr as LiteralNode).value;
      
    case "Identifier": {
      const name = (expr as IdentifierNode).name;
      const symbol = state.symbolTable.lookup(name, expr.lineNumber, true);
      return symbol.value;
    }
      
    case "BinaryExpression": {
      const binExpr = expr as BinaryExpressionNode;
      const left = evaluateExpression(binExpr.left, state);
      const right = evaluateExpression(binExpr.right, state);
      
      switch (binExpr.operator) {
        case "+": return left + right;
        case "-": return left - right;
        case "*": return left * right;
        case "/": return left / right;
        case "DIV": return Math.floor(left / right);
        case "MOD": return left % right;
        case "=": return left === right;
        case "<>": return left !== right;
        case "<": return left < right;
        case ">": return left > right;
        case "<=": return left <= right;
        case ">=": return left >= right;
        case "AND": return left && right;
        case "OR": return left || right;
        case "&": return String(left) + String(right); // Concatenação de strings
        default:
          throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Operador binário desconhecido: ${binExpr.operator}`);
      }
    }
      
    case "UnaryExpression": {
      const unaryExpr = expr as UnaryExpressionNode;
      const argument = evaluateExpression(unaryExpr.argument, state);
      
      switch (unaryExpr.operator) {
        case "-": return -argument;
        case "NOT": return !argument;
        default:
          throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Operador unário desconhecido: ${unaryExpr.operator}`);
      }
    }
      
    case "ArrayAccess": {
      const arrayAccess = expr as ArrayAccessNode;
      const array = evaluateExpression(arrayAccess.arrayExpr, state);
      
      if (!Array.isArray(array)) {
        throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Não é possível aplicar acesso de índice [...] a um tipo não-array.`);
      }
      
      if (arrayAccess.indices.length === 1) {
        // Array unidimensional
        const index = evaluateExpression(arrayAccess.indices[0], state);
        
        // Verifica limites do array
        if (index < 0 || index >= array.length) {
          throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Índice de array fora dos limites.`);
        }
        
        return array[index];
      } else if (arrayAccess.indices.length === 2 && Array.isArray(array[0])) {
        // Array bidimensional
        const index1 = evaluateExpression(arrayAccess.indices[0], state);
        const index2 = evaluateExpression(arrayAccess.indices[1], state);
        
        // Verifica limites do array
        if (index1 < 0 || index1 >= array.length || index2 < 0 || index2 >= array[0].length) {
          throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Índice de array fora dos limites.`);
        }
        
        return array[index1][index2];
      } else {
        throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Número de índices incompatível com a dimensão do array.`);
      }
    }
      
    case "RecordAccess": {
      const recordAccess = expr as RecordAccessNode;
      const record = evaluateExpression(recordAccess.recordExpr, state);
      
      if (typeof record !== "object" || record === null || Array.isArray(record)) {
        throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Não é possível aplicar acesso de campo "." a um tipo não-registro.`);
      }
      
      const fieldName = recordAccess.fieldName;
      
      if (!record.hasOwnProperty(fieldName)) {
        throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Registro não possui o campo '${fieldName}'`);
      }
      
      return record[fieldName];
    }
      
    case "CallExpression": {
      const callExpr = expr as CallExpressionNode;
      const name = callExpr.callee.name;
      
      // Verifica se é uma função built-in
      if (isBuiltInFunction(name)) {
        return callBuiltInFunction(name, callExpr.arguments, state, expr.lineNumber);
      }
      
      // Busca a definição da função
      const subroutine = state.symbolTable.lookupSubroutine(name, expr.lineNumber);
      
      if (!subroutine || subroutine.type !== "FunctionDefinition") {
        throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Função '${name}' não declarada.`);
      }
      
      const functionDef = subroutine as FunctionDefinitionNode;
      
      // Cria um novo escopo para a função
      const functionScope = new SymbolTable(state.symbolTable);
      
      // Avalia os argumentos e declara os parâmetros
      if (callExpr.arguments.length !== functionDef.parameters.length) {
        throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Número incorreto de argumentos para função '${name}'.`);
      }
      
      for (let i = 0; i < functionDef.parameters.length; i++) {
        const param = functionDef.parameters[i];
        const arg = callExpr.arguments[i];
        
        if (param.mode === "BYVAL") {
          // Passa por valor
          const value = evaluateExpression(arg, state);
          functionScope.declare(param.name, param.dataType, false, expr.lineNumber);
          functionScope.assign({ type: "Identifier", name: param.name, lineNumber: expr.lineNumber }, value, state, expr.lineNumber);
        } else {
          // Passa por referência
          if (arg.type !== "Identifier" && arg.type !== "ArrayAccess" && arg.type !== "RecordAccess") {
            throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Argumento para parâmetro BYREF deve ser uma variável.`);
          }
          
          // Para simplificar, assumimos que o argumento é um identificador
          if (arg.type === "Identifier") {
            const argName = (arg as IdentifierNode).name;
            const argSymbol = state.symbolTable.lookup(argName, expr.lineNumber, true);
            
            functionScope.declare(param.name, param.dataType, false, expr.lineNumber, true, { scope: state.symbolTable, name: argName });
          } else {
            throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Passagem por referência de elementos de array ou campos de registro não implementada.`);
          }
        }
      }
      
      // Salva o estado atual
      const previousScope = state.symbolTable;
      const previousReturnValue = state.returnValue;
      const previousReturnSignal = state.returnSignal;
      
      // Configura o novo estado
      state.symbolTable = functionScope;
      state.returnValue = undefined;
      state.returnSignal = false;
      
      // Adiciona o quadro de chamada à pilha
      state.callStack.push({
        scope: functionScope,
        procedureOrFunction: functionDef
      });
      
      // Executa o corpo da função
      for (const statement of functionDef.body) {
        executeStatement(statement, state);
        
        // Verifica se houve um retorno
        if (state.returnSignal) {
          break;
        }
      }
      
      // Remove o quadro de chamada da pilha
      state.callStack.pop();
      
      // Verifica se houve um retorno
      if (!state.returnSignal) {
        throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Função '${name}' não retornou um valor.`);
      }
      
      // Salva o valor de retorno
      const returnValue = state.returnValue;
      
      // Restaura o estado anterior
      state.symbolTable = previousScope;
      state.returnValue = previousReturnValue;
      state.returnSignal = previousReturnSignal;
      
      return returnValue;
    }
      
    case "EOFCheck": {
      const eofCheck = expr as EOFCheckNode;
      const filename = evaluateExpression(eofCheck.filename, state);
      
      // Verifica se o arquivo está aberto
      const file = state.fileSystem.get(filename);
      
      if (!file) {
        throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Arquivo '${filename}' não está aberto.`);
      }
      
      // Verifica se chegou ao fim do arquivo
      return file.readPointer >= file.content.length;
    }
      
    default:
      throw new Error(`Erro de Execução (Linha ${expr.lineNumber}): Tipo de expressão desconhecido: ${expr.type}`);
  }
}

// Verifica se é uma função built-in
function isBuiltInFunction(name: string): boolean {
  const builtInFunctions = ["LENGTH", "MID", "RIGHT", "LCASE", "UCASE", "INT", "RAND"];
  return builtInFunctions.includes(name.toUpperCase());
}

// Chama uma função built-in
function callBuiltInFunction(name: string, args: ExpressionNode[], state: InterpreterState, lineNumber: number): any {
  const upperName = name.toUpperCase();
  
  switch (upperName) {
    case "LENGTH": {
      // LENGTH(str) - Retorna o comprimento de uma string
      if (args.length !== 1) {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Função LENGTH requer 1 argumento.`);
      }
      
      const str = evaluateExpression(args[0], state);
      
      if (typeof str !== "string") {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Argumento de LENGTH deve ser uma string.`);
      }
      
      return str.length;
    }
      
    case "MID": {
      // MID(str, start, length) - Retorna uma substring
      if (args.length !== 3) {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Função MID requer 3 argumentos.`);
      }
      
      const str = evaluateExpression(args[0], state);
      const start = evaluateExpression(args[1], state);
      const length = evaluateExpression(args[2], state);
      
      if (typeof str !== "string") {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Primeiro argumento de MID deve ser uma string.`);
      }
      
      if (typeof start !== "number" || !Number.isInteger(start) || start < 1) {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Segundo argumento de MID deve ser um inteiro positivo.`);
      }
      
      if (typeof length !== "number" || !Number.isInteger(length) || length < 0) {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Terceiro argumento de MID deve ser um inteiro não-negativo.`);
      }
      
      // Ajusta para índice baseado em 0
      return str.substr(start - 1, length);
    }
      
    case "RIGHT": {
      // RIGHT(str, length) - Retorna os últimos caracteres de uma string
      if (args.length !== 2) {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Função RIGHT requer 2 argumentos.`);
      }
      
      const str = evaluateExpression(args[0], state);
      const length = evaluateExpression(args[1], state);
      
      if (typeof str !== "string") {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Primeiro argumento de RIGHT deve ser uma string.`);
      }
      
      if (typeof length !== "number" || !Number.isInteger(length) || length < 0) {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Segundo argumento de RIGHT deve ser um inteiro não-negativo.`);
      }
      
      return str.substr(-length);
    }
      
    case "LCASE": {
      // LCASE(str) - Converte uma string para minúsculas
      if (args.length !== 1) {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Função LCASE requer 1 argumento.`);
      }
      
      const str = evaluateExpression(args[0], state);
      
      if (typeof str !== "string") {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Argumento de LCASE deve ser uma string.`);
      }
      
      return str.toLowerCase();
    }
      
    case "UCASE": {
      // UCASE(str) - Converte uma string para maiúsculas
      if (args.length !== 1) {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Função UCASE requer 1 argumento.`);
      }
      
      const str = evaluateExpression(args[0], state);
      
      if (typeof str !== "string") {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Argumento de UCASE deve ser uma string.`);
      }
      
      return str.toUpperCase();
    }
      
    case "INT": {
      // INT(num) - Converte um número para inteiro (trunca)
      if (args.length !== 1) {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Função INT requer 1 argumento.`);
      }
      
      const num = evaluateExpression(args[0], state);
      
      if (typeof num !== "number") {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Argumento de INT deve ser um número.`);
      }
      
      return Math.floor(num);
    }
      
    case "RAND": {
      // RAND() - Retorna um número aleatório entre 0 e 1
      if (args.length !== 0) {
        throw new Error(`Erro de Execução (Linha ${lineNumber}): Função RAND não requer argumentos.`);
      }
      
      return Math.random();
    }
      
    default:
      throw new Error(`Erro de Execução (Linha ${lineNumber}): Função built-in desconhecida: ${name}`);
  }
}

// Executa uma declaração
function executeStatement(stmt: StatementNode, state: InterpreterState): void {
  // Verifica se já houve um retorno
  if (state.returnSignal) {
    return;
  }
  
  switch (stmt.type) {
    case "VariableDeclaration": {
      const varDecl = stmt as VariableDeclarationNode;
      state.symbolTable.declare(varDecl.identifier, varDecl.dataType, varDecl.isConstant, stmt.lineNumber);
      break;
    }
      
    case "Assignment": {
      const assignment = stmt as AssignmentNode;
      const value = evaluateExpression(assignment.right, state);
      state.symbolTable.assign(assignment.left, value, state, stmt.lineNumber);
      break;
    }
      
    case "IfStatement": {
      const ifStmt = stmt as IfStatementNode;
      const condition = evaluateExpression(ifStmt.condition, state);
      
      if (condition) {
        // Executa o corpo do THEN
        for (const statement of ifStmt.thenBody) {
          executeStatement(statement, state);
          
          // Verifica se houve um retorno
          if (state.returnSignal) {
            return;
          }
        }
      } else if (ifStmt.elseBody) {
        // Executa o corpo do ELSE
        for (const statement of ifStmt.elseBody) {
          executeStatement(statement, state);
          
          // Verifica se houve um retorno
          if (state.returnSignal) {
            return;
          }
        }
      }
      break;
    }
      
    case "CaseStatement": {
      const caseStmt = stmt as CaseStatementNode;
      const value = evaluateExpression(caseStmt.expression, state);
      
      let matched = false;
      
      // Verifica cada caso
      for (const caseClause of caseStmt.cases) {
        if (caseClause.value.hasOwnProperty("from")) {
          // Intervalo de valores
          const range = caseClause.value as { from: ExpressionNode, to: ExpressionNode };
          const from = evaluateExpression(range.from, state);
          const to = evaluateExpression(range.to, state);
          
          if (value >= from && value <= to) {
            matched = true;
            
            // Executa o corpo do caso
            for (const statement of caseClause.body) {
              executeStatement(statement, state);
              
              // Verifica se houve um retorno
              if (state.returnSignal) {
                return;
              }
            }
            
            break;
          }
        } else {
          // Valor único
          const caseValue = evaluateExpression(caseClause.value as ExpressionNode, state);
          
          if (value === caseValue) {
            matched = true;
            
            // Executa o corpo do caso
            for (const statement of caseClause.body) {
              executeStatement(statement, state);
              
              // Verifica se houve um retorno
              if (state.returnSignal) {
                return;
              }
            }
            
            break;
          }
        }
      }
      
      // Se nenhum caso corresponder, executa OTHERWISE
      if (!matched && caseStmt.otherwise) {
        for (const statement of caseStmt.otherwise) {
          executeStatement(statement, state);
          
          // Verifica se houve um retorno
          if (state.returnSignal) {
            return;
          }
        }
      }
      break;
    }
      
    case "ForLoop": {
      const forLoop = stmt as ForLoopNode;
      const varName = forLoop.variable.name;
      
      // Inicializa a variável de controle
      const start = evaluateExpression(forLoop.start, state);
      const end = evaluateExpression(forLoop.end, state);
      const step = forLoop.step ? evaluateExpression(forLoop.step, state) : 1;
      
      // Verifica se a variável de controle existe
      const symbol = state.symbolTable.lookup(varName, stmt.lineNumber, true);
      
      // Atribui o valor inicial
      state.symbolTable.assign(forLoop.variable, start, state, stmt.lineNumber);
      
      // Executa o loop
      if (step > 0) {
        for (let i = start; i <= end; i += step) {
          // Atualiza a variável de controle
          state.symbolTable.assign(forLoop.variable, i, state, stmt.lineNumber);
          
          // Executa o corpo do loop
          for (const statement of forLoop.body) {
            executeStatement(statement, state);
            
            // Verifica se houve um retorno
            if (state.returnSignal) {
              return;
            }
          }
        }
      } else {
        for (let i = start; i >= end; i += step) {
          // Atualiza a variável de controle
          state.symbolTable.assign(forLoop.variable, i, state, stmt.lineNumber);
          
          // Executa o corpo do loop
          for (const statement of forLoop.body) {
            executeStatement(statement, state);
            
            // Verifica se houve um retorno
            if (state.returnSignal) {
              return;
            }
          }
        }
      }
      break;
    }
      
    case "WhileLoop": {
      const whileLoop = stmt as WhileLoopNode;
      
      while (evaluateExpression(whileLoop.condition, state)) {
        // Executa o corpo do loop
        for (const statement of whileLoop.body) {
          executeStatement(statement, state);
          
          // Verifica se houve um retorno
          if (state.returnSignal) {
            return;
          }
        }
      }
      break;
    }
      
    case "RepeatLoop": {
      const repeatLoop = stmt as RepeatLoopNode;
      
      do {
        // Executa o corpo do loop
        for (const statement of repeatLoop.body) {
          executeStatement(statement, state);
          
          // Verifica se houve um retorno
          if (state.returnSignal) {
            return;
          }
        }
      } while (!evaluateExpression(repeatLoop.condition, state));
      break;
    }
      
    case "ProcedureDefinition": {
      const procDef = stmt as ProcedureDefinitionNode;
      state.symbolTable.declareSubroutine(procDef.name, procDef, stmt.lineNumber);
      break;
    }
      
    case "FunctionDefinition": {
      const funcDef = stmt as FunctionDefinitionNode;
      state.symbolTable.declareSubroutine(funcDef.name, funcDef, stmt.lineNumber);
      break;
    }
      
    case "ProcedureCall": {
      const procCall = stmt as ProcedureCallNode;
      const name = procCall.name;
      
      // Busca a definição do procedimento
      const subroutine = state.symbolTable.lookupSubroutine(name, stmt.lineNumber);
      
      if (!subroutine || subroutine.type !== "ProcedureDefinition") {
        throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Procedimento '${name}' não declarado.`);
      }
      
      const procDef = subroutine as ProcedureDefinitionNode;
      
      // Cria um novo escopo para o procedimento
      const procScope = new SymbolTable(state.symbolTable);
      
      // Avalia os argumentos e declara os parâmetros
      if (procCall.arguments.length !== procDef.parameters.length) {
        throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Número incorreto de argumentos para procedimento '${name}'.`);
      }
      
      for (let i = 0; i < procDef.parameters.length; i++) {
        const param = procDef.parameters[i];
        const arg = procCall.arguments[i];
        
        if (param.mode === "BYVAL") {
          // Passa por valor
          const value = evaluateExpression(arg, state);
          procScope.declare(param.name, param.dataType, false, stmt.lineNumber);
          procScope.assign({ type: "Identifier", name: param.name, lineNumber: stmt.lineNumber }, value, state, stmt.lineNumber);
        } else {
          // Passa por referência
          if (arg.type !== "Identifier" && arg.type !== "ArrayAccess" && arg.type !== "RecordAccess") {
            throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Argumento para parâmetro BYREF deve ser uma variável.`);
          }
          
          // Para simplificar, assumimos que o argumento é um identificador
          if (arg.type === "Identifier") {
            const argName = (arg as IdentifierNode).name;
            const argSymbol = state.symbolTable.lookup(argName, stmt.lineNumber, true);
            
            procScope.declare(param.name, param.dataType, false, stmt.lineNumber, true, { scope: state.symbolTable, name: argName });
          } else {
            throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Passagem por referência de elementos de array ou campos de registro não implementada.`);
          }
        }
      }
      
      // Salva o estado atual
      const previousScope = state.symbolTable;
      const previousReturnSignal = state.returnSignal;
      
      // Configura o novo estado
      state.symbolTable = procScope;
      state.returnSignal = false;
      
      // Adiciona o quadro de chamada à pilha
      state.callStack.push({
        scope: procScope,
        procedureOrFunction: procDef
      });
      
      // Executa o corpo do procedimento
      for (const statement of procDef.body) {
        executeStatement(statement, state);
        
        // Verifica se houve um retorno
        if (state.returnSignal) {
          break;
        }
      }
      
      // Remove o quadro de chamada da pilha
      state.callStack.pop();
      
      // Restaura o estado anterior
      state.symbolTable = previousScope;
      state.returnSignal = previousReturnSignal;
      break;
    }
      
    case "Return": {
      const returnStmt = stmt as ReturnNode;
      
      // Verifica se estamos dentro de uma função
      if (state.callStack.length === 0) {
        throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Comando RETURN fora de procedimento ou função.`);
      }
      
      const currentFrame = state.callStack[state.callStack.length - 1];
      
      // Verifica se é uma função
      if (currentFrame.procedureOrFunction && currentFrame.procedureOrFunction.type === "FunctionDefinition") {
        // Verifica se há uma expressão de retorno
        if (!returnStmt.expression) {
          throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Função deve retornar um valor.`);
        }
        
        // Avalia a expressão de retorno
        state.returnValue = evaluateExpression(returnStmt.expression, state);
      } else {
        // Procedimento não deve retornar valor
        if (returnStmt.expression) {
          throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Procedimento não deve retornar um valor.`);
        }
      }
      
      // Sinaliza o retorno
      state.returnSignal = true;
      break;
    }
      
    case "Input": {
      const inputStmt = stmt as InputNode;
      
      // Simula a entrada do usuário
      // Em uma implementação real, isso seria interativo
      const input = prompt("Entrada:") || "";
      
      // Atribui o valor à variável
      state.symbolTable.assign(inputStmt.variable, input, state, stmt.lineNumber);
      break;
    }
      
    case "Output": {
      const outputStmt = stmt as OutputNode;
      
      // Avalia as expressões e adiciona à saída
      const values = outputStmt.expressions.map(expr => evaluateExpression(expr, state));
      state.output.push(values.join(" "));
      break;
    }
      
    case "FileOperation": {
      const fileOp = stmt as FileOperationNode;
      const filename = evaluateExpression(fileOp.filename, state);
      
      switch (fileOp.operation) {
        case "OPENFILE": {
          // Verifica se o arquivo já está aberto
          if (state.fileSystem.has(filename)) {
            throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Arquivo '${filename}' já está aberto.`);
          }
          
          // Verifica o modo
          if (!fileOp.mode) {
            throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Modo de arquivo não especificado.`);
          }
          
          // Cria um novo arquivo
          const file: OpenFile = {
            content: [],
            readPointer: 0,
            mode: fileOp.mode
          };
          
          // Adiciona ao sistema de arquivos
          state.fileSystem.set(filename, file);
          break;
        }
          
        case "READFILE": {
          // Verifica se o arquivo está aberto
          const file = state.fileSystem.get(filename);
          
          if (!file) {
            throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Arquivo '${filename}' não está aberto.`);
          }
          
          // Verifica o modo
          if (file.mode !== "READ") {
            throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Arquivo '${filename}' não está aberto para leitura.`);
          }
          
          // Verifica se chegou ao fim do arquivo
          if (file.readPointer >= file.content.length) {
            throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Tentativa de ler além do fim do arquivo '${filename}'.`);
          }
          
          // Lê a próxima linha
          const line = file.content[file.readPointer++];
          
          // Atribui o valor à variável
          if (fileOp.variable) {
            state.symbolTable.assign(fileOp.variable, line, state, stmt.lineNumber);
          }
          break;
        }
          
        case "WRITEFILE": {
          // Verifica se o arquivo está aberto
          const file = state.fileSystem.get(filename);
          
          if (!file) {
            throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Arquivo '${filename}' não está aberto.`);
          }
          
          // Verifica o modo
          if (file.mode !== "WRITE" && file.mode !== "APPEND") {
            throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Arquivo '${filename}' não está aberto para escrita.`);
          }
          
          // Avalia os dados
          if (!fileOp.data) {
            throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Dados não especificados para escrita.`);
          }
          
          const data = evaluateExpression(fileOp.data, state);
          
          // Escreve no arquivo
          if (file.mode === "WRITE") {
            // Limpa o conteúdo anterior
            file.content = [String(data)];
          } else {
            // Adiciona ao conteúdo
            file.content.push(String(data));
          }
          break;
        }
          
        case "CLOSEFILE": {
          // Verifica se o arquivo está aberto
          if (!state.fileSystem.has(filename)) {
            throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Arquivo '${filename}' não está aberto.`);
          }
          
          // Remove do sistema de arquivos
          state.fileSystem.delete(filename);
          break;
        }
      }
      break;
    }
      
    case "RecordTypeDefinition": {
      const typeDef = stmt as RecordTypeDefinitionNode;
      state.symbolTable.declareType(typeDef.name, typeDef, stmt.lineNumber);
      break;
    }
      
    default:
      throw new Error(`Erro de Execução (Linha ${stmt.lineNumber}): Tipo de declaração desconhecido: ${stmt.type}`);
  }
}

// Função principal para interpretar o pseudocódigo
export function interpretPseudocode(code: string): InterpretResult {
  try {
    // Cria o lexer
    const lexer = new Lexer(code);
    
    // Cria o parser
    const parser = new Parser(lexer);
    
    // Analisa o código
    const { program, errors } = parser.parse();
    
    // Verifica se houve erros de sintaxe
    if (errors.length > 0) {
      return {
        output: [],
        errors: errors.map(error => ({
          lineNumber: error.lineNumber,
          message: error.message,
          type: "Syntax"
        }))
      };
    }
    
    // Verifica se o programa foi analisado com sucesso
    if (!program) {
      return {
        output: [],
        errors: [{
          lineNumber: 1,
          message: "Falha ao analisar o programa.",
          type: "Syntax"
        }]
      };
    }
    
    // Cria o estado inicial do interpretador
    const globalScope = new SymbolTable();
    const state: InterpreterState = {
      symbolTable: globalScope,
      output: [],
      callStack: [],
      globalScope,
      returnSignal: false,
      fileSystem: new Map()
    };
    
    // Executa o programa
    try {
      for (const statement of program.body) {
        executeStatement(statement, state);
      }
      
      // Retorna a saída
      return {
        output: state.output,
        errors: []
      };
    } catch (error) {
      // Erro de tempo de execução
      if (error instanceof Error) {
        return {
          output: state.output,
          errors: [{
            lineNumber: 0, // Linha desconhecida
            message: error.message,
            type: "Runtime"
          }]
        };
      } else {
        return {
          output: state.output,
          errors: [{
            lineNumber: 0,
            message: "Erro desconhecido durante a execução.",
            type: "Runtime"
          }]
        };
      }
    }
  } catch (error) {
    // Erro durante a análise
    if (error instanceof Error) {
      return {
        output: [],
        errors: [{
          lineNumber: 0,
          message: error.message,
          type: "Syntax"
        }]
      };
    } else {
      return {
        output: [],
        errors: [{
          lineNumber: 0,
          message: "Erro desconhecido durante a análise.",
          type: "Syntax"
        }]
      };
    }
  }
}

// Função auxiliar para simular prompt (em ambiente de navegador)
function prompt(message: string): string | null {
  // Em um ambiente Node.js, isso seria implementado de forma diferente
  // Para o navegador, usamos o prompt nativo
  if (typeof window !== 'undefined') {
    return window.prompt(message);
  }
  
  // Fallback para testes
  return "";
}
