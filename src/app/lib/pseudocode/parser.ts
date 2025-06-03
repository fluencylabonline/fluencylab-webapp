// src/lib/pseudocode/parser.ts

/**
 * Parser (Analisador Sintático) para Pseudocódigo Cambridge
 * 
 * Este módulo implementa um analisador sintático completo para o pseudocódigo Cambridge,
 * convertendo tokens em uma árvore sintática abstrata (AST) que pode ser interpretada.
 */

import { Lexer, Token, TokenType } from './lexer';
import {
  AstNode, ProgramNode, StatementNode, ExpressionNode,
  VariableDeclarationNode, AssignmentNode, IfStatementNode,
  CaseStatementNode, CaseClauseNode, ForLoopNode, WhileLoopNode,
  RepeatLoopNode, InputNode, OutputNode, ProcedureDefinitionNode,
  FunctionDefinitionNode, ParameterNode, ProcedureCallNode, ReturnNode,
  DataTypeNode, ArrayTypeNode, ArrayDimensionNode, RecordTypeIdentifierNode,
  RecordTypeDefinitionNode, RecordFieldNode, FileOperationNode, EOFCheckNode,
  IdentifierNode, LiteralNode, BinaryExpressionNode, UnaryExpressionNode,
  ArrayAccessNode, RecordAccessNode, CallExpressionNode, SyntaxError
} from './types';

export class Parser {
  private tokens: Token[] = [];
  private current: number = 0;
  private errors: SyntaxError[] = [];

  constructor(lexer: Lexer | Token[]) {
    if (Array.isArray(lexer)) {
      this.tokens = lexer;
    } else {
      this.tokens = lexer.tokenize();
    }
  }

  // Método principal para analisar o programa
  public parse(): { program: ProgramNode | null, errors: SyntaxError[] } {
    try {
      const program = this.program();
      return { program, errors: this.errors };
    } catch (error) {
      if (error instanceof Error) {
        this.errors.push({
          lineNumber: this.peek().lineNumber,
          column: this.peek().column,
          message: error.message
        });
      }
      return { program: null, errors: this.errors };
    }
  }

  // Métodos auxiliares para navegação de tokens

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF_TOKEN;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    const token = this.peek();
    this.errors.push({
      lineNumber: token.lineNumber,
      column: token.column,
      message: message
    });
    throw new Error(message);
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.NEWLINE) return;

      switch (this.peek().type) {
        case TokenType.DECLARE:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.FOR:
        case TokenType.REPEAT:
        case TokenType.PROCEDURE:
        case TokenType.FUNCTION:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }

  // Métodos para análise sintática

  private program(): ProgramNode {
    const statements: StatementNode[] = [];
    
    while (!this.isAtEnd()) {
      try {
        // Ignora linhas em branco e comentários
        while (this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
          // Continua para o próximo token
        }
        
        if (this.isAtEnd()) break;
        
        statements.push(this.statement());
      } catch (error) {
        this.synchronize();
      }
    }
    
    return {
      type: "Program",
      body: statements,
      lineNumber: statements.length > 0 ? statements[0].lineNumber : 1
    };
  }

  private statement(): StatementNode {
    if (this.match(TokenType.DECLARE)) return this.variableDeclaration();
    if (this.match(TokenType.CONSTANT)) return this.constantDeclaration();
    if (this.match(TokenType.TYPE)) return this.typeDefinition();
    if (this.match(TokenType.IF)) return this.ifStatement();
    if (this.match(TokenType.CASE)) return this.caseStatement();
    if (this.match(TokenType.FOR)) return this.forLoop();
    if (this.match(TokenType.WHILE)) return this.whileLoop();
    if (this.match(TokenType.REPEAT)) return this.repeatLoop();
    if (this.match(TokenType.PROCEDURE)) return this.procedureDefinition();
    if (this.match(TokenType.FUNCTION)) return this.functionDefinition();
    if (this.match(TokenType.CALL)) return this.procedureCall();
    if (this.match(TokenType.RETURN)) return this.returnStatement();
    if (this.match(TokenType.INPUT)) return this.inputStatement();
    if (this.match(TokenType.OUTPUT)) return this.outputStatement();
    if (this.match(TokenType.OPENFILE, TokenType.READFILE, TokenType.WRITEFILE, TokenType.CLOSEFILE)) 
      return this.fileOperation();
    
    // Se não for nenhuma das declarações acima, deve ser uma atribuição
    return this.assignmentStatement();
  }

  private variableDeclaration(): VariableDeclarationNode {
    const lineNumber = this.previous().lineNumber;
    const identifier = this.consume(TokenType.IDENTIFIER, "Esperado nome de variável após 'DECLARE'").value;
    
    this.consume(TokenType.COLON, "Esperado ':' após nome da variável");
    
    const dataType = this.type();
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após declaração de variável");
    
    return {
      type: "VariableDeclaration",
      identifier,
      dataType,
      isConstant: false,
      lineNumber
    };
  }

  private constantDeclaration(): VariableDeclarationNode {
    const lineNumber = this.previous().lineNumber;
    const identifier = this.consume(TokenType.IDENTIFIER, "Esperado nome de constante após 'CONSTANT'").value;
    
    this.consume(TokenType.EQUAL, "Esperado '=' após nome da constante");
    
    // Para constantes, o valor é obrigatório
    const valueExpr = this.expression();
    
    // Determina o tipo com base no valor
    let dataType: DataTypeNode;
    if (valueExpr.type === "Literal") {
      const literal = valueExpr as LiteralNode;
      dataType = {
        type: "DataType",
        name: literal.dataType,
        lineNumber
      };
    } else {
      // Se não for um literal, assume INTEGER como padrão
      dataType = {
        type: "DataType",
        name: "INTEGER",
        lineNumber
      };
    }
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após declaração de constante");
    
    return {
      type: "VariableDeclaration",
      identifier,
      dataType,
      isConstant: true,
      lineNumber
    };
  }

  private type(): DataTypeNode | ArrayTypeNode | RecordTypeIdentifierNode {
    if (this.match(TokenType.ARRAY)) {
      return this.arrayType();
    }
    
    // Verifica se é um tipo básico
    if (this.match(TokenType.INTEGER, TokenType.REAL, TokenType.STRING, 
                   TokenType.CHAR, TokenType.BOOLEAN, TokenType.DATE)) {
      return {
        type: "DataType",
        name: this.previous().type === TokenType.INTEGER ? "INTEGER" :
              this.previous().type === TokenType.REAL ? "REAL" :
              this.previous().type === TokenType.STRING ? "STRING" :
              this.previous().type === TokenType.CHAR ? "CHAR" :
              this.previous().type === TokenType.BOOLEAN ? "BOOLEAN" : "DATE",
        lineNumber: this.previous().lineNumber
      };
    }
    
    // Se não for um tipo básico ou array, deve ser um tipo definido pelo usuário
    const identifier = this.consume(TokenType.IDENTIFIER, "Esperado tipo de dados").value;
    
    return {
      type: "RecordTypeIdentifier",
      name: identifier,
      lineNumber: this.previous().lineNumber
    };
  }

  private arrayType(): ArrayTypeNode {
    const lineNumber = this.previous().lineNumber;
    
    // Consome o colchete de abertura
    this.consume(TokenType.LBRACKET, "Esperado '[' após 'ARRAY'");
    
    const dimensions: ArrayDimensionNode[] = [];
    
    // Processa a primeira dimensão
    dimensions.push(this.arrayDimension());
    
    // Processa dimensões adicionais, se houver
    while (this.match(TokenType.COMMA)) {
      dimensions.push(this.arrayDimension());
    }
    
    // Consome o colchete de fechamento
    this.consume(TokenType.RBRACKET, "Esperado ']' após dimensões do array");
    
    // Consome OF
    this.consume(TokenType.OF, "Esperado 'OF' após dimensões do array");
    
    // Processa o tipo dos elementos
    const elementType = this.type();
    
    return {
      type: "ArrayType",
      elementType,
      dimensions,
      lineNumber
    };
  }

  private arrayDimension(): ArrayDimensionNode {
    const lineNumber = this.peek().lineNumber;
    
    // Processa o limite inferior
    const lowerBound = this.expression();
    
    // Consome o separador
    this.consume(TokenType.COLON, "Esperado ':' entre limites da dimensão do array");
    
    // Processa o limite superior
    const upperBound = this.expression();
    
    return {
      type: "ArrayDimension",
      lowerBound,
      upperBound,
      lineNumber
    };
  }

  private typeDefinition(): RecordTypeDefinitionNode {
    const lineNumber = this.previous().lineNumber;
    
    // Consome o nome do tipo
    const name = this.consume(TokenType.IDENTIFIER, "Esperado nome do tipo após 'TYPE'").value;
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após nome do tipo");
    
    const fields: RecordFieldNode[] = [];
    
    // Processa os campos do registro
    while (!this.check(TokenType.ENDTYPE) && !this.isAtEnd()) {
      if (this.match(TokenType.DECLARE)) {
        const fieldName = this.consume(TokenType.IDENTIFIER, "Esperado nome do campo após 'DECLARE'").value;
        
        this.consume(TokenType.COLON, "Esperado ':' após nome do campo");
        
        const dataType = this.type();
        
        fields.push({
          type: "RecordField",
          name: fieldName,
          dataType,
          lineNumber: this.previous().lineNumber
        });
        
        // Consome o final da linha
        this.consumeNewline("Esperado fim de linha após declaração de campo");
      } else {
        // Ignora linhas em branco e comentários
        if (!this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
          this.errors.push({
            lineNumber: this.peek().lineNumber,
            column: this.peek().column,
            message: "Esperado 'DECLARE' para campo de registro"
          });
          this.synchronize();
        }
      }
    }
    
    // Consome ENDTYPE
    this.consume(TokenType.ENDTYPE, "Esperado 'ENDTYPE' para finalizar definição de tipo");
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após 'ENDTYPE'");
    
    return {
      type: "RecordTypeDefinition",
      name,
      fields,
      lineNumber
    };
  }

  private ifStatement(): IfStatementNode {
    const lineNumber = this.previous().lineNumber;
    
    // Processa a condição
    const condition = this.expression();
    
    // Consome THEN
    this.consume(TokenType.THEN, "Esperado 'THEN' após condição do IF");
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após 'THEN'");
    
    const thenBody: StatementNode[] = [];
    
    // Processa o corpo do THEN
    while (!this.check(TokenType.ELSE) && !this.check(TokenType.ENDIF) && !this.isAtEnd()) {
      // Ignora linhas em branco e comentários
      if (this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
        continue;
      }
      
      thenBody.push(this.statement());
    }
    
    let elseBody: StatementNode[] | undefined;
    
    // Processa o ELSE, se houver
    if (this.match(TokenType.ELSE)) {
      // Consome o final da linha
      this.consumeNewline("Esperado fim de linha após 'ELSE'");
      
      elseBody = [];
      
      // Processa o corpo do ELSE
      while (!this.check(TokenType.ENDIF) && !this.isAtEnd()) {
        // Ignora linhas em branco e comentários
        if (this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
          continue;
        }
        
        elseBody.push(this.statement());
      }
    }
    
    // Consome ENDIF
    this.consume(TokenType.ENDIF, "Esperado 'ENDIF' para finalizar estrutura IF");
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após 'ENDIF'");
    
    return {
      type: "IfStatement",
      condition,
      thenBody,
      elseBody,
      lineNumber
    };
  }

  private caseStatement(): CaseStatementNode {
    const lineNumber = this.previous().lineNumber;
    
    // Consome OF
    this.consume(TokenType.OF, "Esperado 'OF' após 'CASE'");
    
    // Processa a expressão do CASE
    const expression = this.expression();
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após expressão do CASE");
    
    const cases: CaseClauseNode[] = [];
    let otherwise: StatementNode[] | undefined;
    
    // Processa as cláusulas do CASE
    while (!this.check(TokenType.ENDCASE) && !this.check(TokenType.OTHERWISE) && !this.isAtEnd()) {
      // Ignora linhas em branco e comentários
      if (this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
        continue;
      }
      
      // Processa o valor do caso
      let value: ExpressionNode | { from: ExpressionNode, to: ExpressionNode };
      
      const valueExpr = this.expression();
      
      // Verifica se é um intervalo (usando TO)
      if (this.match(TokenType.TO)) {
        const toExpr = this.expression();
        value = { from: valueExpr, to: toExpr };
      } else {
        value = valueExpr;
      }
      
      // Consome o separador
      this.consume(TokenType.COLON, "Esperado ':' após valor do caso");
      
      // Processa o corpo do caso
      const body: StatementNode[] = [];
      
      // Consome o final da linha
      this.consumeNewline("Esperado fim de linha após ':'");
      
      // Processa as declarações do caso
      while (!this.check(TokenType.LITERAL_INTEGER) && 
             !this.check(TokenType.LITERAL_REAL) && 
             !this.check(TokenType.LITERAL_STRING) && 
             !this.check(TokenType.LITERAL_CHAR) && 
             !this.check(TokenType.LITERAL_BOOLEAN) && 
             !this.check(TokenType.ENDCASE) && 
             !this.check(TokenType.OTHERWISE) && 
             !this.isAtEnd()) {
        // Ignora linhas em branco e comentários
        if (this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
          continue;
        }
        
        body.push(this.statement());
      }
      
      cases.push({
        type: "CaseClause",
        value,
        body,
        lineNumber: valueExpr.lineNumber
      });
    }
    
    // Processa OTHERWISE, se houver
    if (this.match(TokenType.OTHERWISE)) {
      // Consome o separador
      this.consume(TokenType.COLON, "Esperado ':' após 'OTHERWISE'");
      
      // Consome o final da linha
      this.consumeNewline("Esperado fim de linha após ':'");
      
      otherwise = [];
      
      // Processa o corpo do OTHERWISE
      while (!this.check(TokenType.ENDCASE) && !this.isAtEnd()) {
        // Ignora linhas em branco e comentários
        if (this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
          continue;
        }
        
        otherwise.push(this.statement());
      }
    }
    
    // Consome ENDCASE
    this.consume(TokenType.ENDCASE, "Esperado 'ENDCASE' para finalizar estrutura CASE");
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após 'ENDCASE'");
    
    return {
      type: "CaseStatement",
      expression,
      cases,
      otherwise,
      lineNumber
    };
  }

  private forLoop(): ForLoopNode {
    const lineNumber = this.previous().lineNumber;
    
    // Processa a variável de controle
    const variableName = this.consume(TokenType.IDENTIFIER, "Esperado nome de variável após 'FOR'").value;
    const variable: IdentifierNode = {
      type: "Identifier",
      name: variableName,
      lineNumber
    };
    
    // Consome o operador de atribuição
    this.consume(TokenType.ASSIGN, "Esperado '←' após nome da variável");
    
    // Processa o valor inicial
    const start = this.expression();
    
    // Consome TO
    this.consume(TokenType.TO, "Esperado 'TO' após valor inicial");
    
    // Processa o valor final
    const end = this.expression();
    
    // Processa o incremento, se houver
    let step: ExpressionNode | undefined;
    if (this.match(TokenType.STEP)) {
      step = this.expression();
    }
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após definição do loop FOR");
    
    const body: StatementNode[] = [];
    
    // Processa o corpo do loop
    while (!this.check(TokenType.NEXT) && !this.isAtEnd()) {
      // Ignora linhas em branco e comentários
      if (this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
        continue;
      }
      
      body.push(this.statement());
    }
    
    // Consome NEXT
    this.consume(TokenType.NEXT, "Esperado 'NEXT' para finalizar loop FOR");
    
    // Consome o nome da variável após NEXT
    this.consume(TokenType.IDENTIFIER, "Esperado nome da variável após 'NEXT'");
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após 'NEXT'");
    
    return {
      type: "ForLoop",
      variable,
      start,
      end,
      step,
      body,
      lineNumber
    };
  }

  private whileLoop(): WhileLoopNode {
    const lineNumber = this.previous().lineNumber;
    
    // Processa a condição
    const condition = this.expression();
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após condição do WHILE");
    
    const body: StatementNode[] = [];
    
    // Processa o corpo do loop
    while (!this.check(TokenType.ENDWHILE) && !this.isAtEnd()) {
      // Ignora linhas em branco e comentários
      if (this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
        continue;
      }
      
      body.push(this.statement());
    }
    
    // Consome ENDWHILE
    this.consume(TokenType.ENDWHILE, "Esperado 'ENDWHILE' para finalizar loop WHILE");
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após 'ENDWHILE'");
    
    return {
      type: "WhileLoop",
      condition,
      body,
      lineNumber
    };
  }

  private repeatLoop(): RepeatLoopNode {
    const lineNumber = this.previous().lineNumber;
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após 'REPEAT'");
    
    const body: StatementNode[] = [];
    
    // Processa o corpo do loop
    while (!this.check(TokenType.UNTIL) && !this.isAtEnd()) {
      // Ignora linhas em branco e comentários
      if (this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
        continue;
      }
      
      body.push(this.statement());
    }
    
    // Consome UNTIL
    this.consume(TokenType.UNTIL, "Esperado 'UNTIL' para finalizar loop REPEAT");
    
    // Processa a condição
    const condition = this.expression();
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após condição do UNTIL");
    
    return {
      type: "RepeatLoop",
      condition,
      body,
      lineNumber
    };
  }

  private procedureDefinition(): ProcedureDefinitionNode {
    const lineNumber = this.previous().lineNumber;
    
    // Processa o nome do procedimento
    const name = this.consume(TokenType.IDENTIFIER, "Esperado nome do procedimento após 'PROCEDURE'").value;
    
    // Processa os parâmetros
    const parameters = this.parameterList();
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após definição do procedimento");
    
    const body: StatementNode[] = [];
    
    // Processa o corpo do procedimento
    while (!this.check(TokenType.ENDPROCEDURE) && !this.isAtEnd()) {
      // Ignora linhas em branco e comentários
      if (this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
        continue;
      }
      
      body.push(this.statement());
    }
    
    // Consome ENDPROCEDURE
    this.consume(TokenType.ENDPROCEDURE, "Esperado 'ENDPROCEDURE' para finalizar definição de procedimento");
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após 'ENDPROCEDURE'");
    
    return {
      type: "ProcedureDefinition",
      name,
      parameters,
      body,
      lineNumber
    };
  }

  private functionDefinition(): FunctionDefinitionNode {
    const lineNumber = this.previous().lineNumber;
    
    // Processa o nome da função
    const name = this.consume(TokenType.IDENTIFIER, "Esperado nome da função após 'FUNCTION'").value;
    
    // Processa os parâmetros
    const parameters = this.parameterList();
    
    // Consome RETURNS
    this.consume(TokenType.RETURNS, "Esperado 'RETURNS' após parâmetros da função");
    
    // Processa o tipo de retorno
    const returnType = this.type();
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após definição da função");
    
    const body: StatementNode[] = [];
    
    // Processa o corpo da função
    while (!this.check(TokenType.ENDFUNCTION) && !this.isAtEnd()) {
      // Ignora linhas em branco e comentários
      if (this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
        continue;
      }
      
      body.push(this.statement());
    }
    
    // Consome ENDFUNCTION
    this.consume(TokenType.ENDFUNCTION, "Esperado 'ENDFUNCTION' para finalizar definição de função");
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após 'ENDFUNCTION'");
    
    return {
      type: "FunctionDefinition",
      name,
      parameters,
      returnType,
      body,
      lineNumber
    };
  }

  private parameterList(): ParameterNode[] {
    const parameters: ParameterNode[] = [];
    
    // Verifica se há parâmetros
    if (this.match(TokenType.LPAREN)) {
      // Processa o primeiro parâmetro, se houver
      if (!this.check(TokenType.RPAREN)) {
        parameters.push(this.parameter());
        
        // Processa parâmetros adicionais
        while (this.match(TokenType.COMMA)) {
          parameters.push(this.parameter());
        }
      }
      
      // Consome o parêntese de fechamento
      this.consume(TokenType.RPAREN, "Esperado ')' após lista de parâmetros");
    }
    
    return parameters;
  }

  private parameter(): ParameterNode {
    const lineNumber = this.peek().lineNumber;
    
    // Verifica o modo do parâmetro (BYVAL ou BYREF)
    let mode: "BYVAL" | "BYREF" = "BYVAL"; // BYVAL é o padrão
    if (this.match(TokenType.BYVAL)) {
      mode = "BYVAL";
    } else if (this.match(TokenType.BYREF)) {
      mode = "BYREF";
    }
    
    // Processa o nome do parâmetro
    const name = this.consume(TokenType.IDENTIFIER, "Esperado nome do parâmetro").value;
    
    // Consome o separador
    this.consume(TokenType.COLON, "Esperado ':' após nome do parâmetro");
    
    // Processa o tipo do parâmetro
    const dataType = this.type();
    
    return {
      type: "Parameter",
      name,
      dataType,
      mode,
      lineNumber
    };
  }

  private procedureCall(): ProcedureCallNode {
    const lineNumber = this.previous().lineNumber;
    
    // Processa o nome do procedimento
    const name = this.consume(TokenType.IDENTIFIER, "Esperado nome do procedimento após 'CALL'").value;
    
    // Processa os argumentos
    const args: ExpressionNode[] = [];
    
    // Verifica se há argumentos
    if (this.match(TokenType.LPAREN)) {
      // Processa o primeiro argumento, se houver
      if (!this.check(TokenType.RPAREN)) {
        args.push(this.expression());
        
        // Processa argumentos adicionais
        while (this.match(TokenType.COMMA)) {
          args.push(this.expression());
        }
      }
      
      // Consome o parêntese de fechamento
      this.consume(TokenType.RPAREN, "Esperado ')' após lista de argumentos");
    }
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após chamada de procedimento");
    
    return {
      type: "ProcedureCall",
      name,
      arguments: args,
      lineNumber
    };
  }

  private returnStatement(): ReturnNode {
    const lineNumber = this.previous().lineNumber;
    
    // Verifica se há uma expressão de retorno
    let expression: ExpressionNode | undefined;
    if (!this.check(TokenType.NEWLINE) && !this.check(TokenType.COMMENT)) {
      expression = this.expression();
    }
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após comando RETURN");
    
    return {
      type: "Return",
      expression,
      lineNumber
    };
  }

  private inputStatement(): InputNode {
    const lineNumber = this.previous().lineNumber;
    
    // Processa a variável
    const variable = this.expression();
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após comando INPUT");
    
    return {
      type: "Input",
      variable,
      lineNumber
    };
  }

  private outputStatement(): OutputNode {
    const lineNumber = this.previous().lineNumber;
    
    // Processa as expressões
    const expressions: ExpressionNode[] = [];
    
    // Processa a primeira expressão
    expressions.push(this.expression());
    
    // Processa expressões adicionais
    while (this.match(TokenType.COMMA)) {
      expressions.push(this.expression());
    }
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após comando OUTPUT");
    
    return {
      type: "Output",
      expressions,
      lineNumber
    };
  }

  private fileOperation(): FileOperationNode {
    const operation = this.previous().type === TokenType.OPENFILE ? "OPENFILE" :
                      this.previous().type === TokenType.READFILE ? "READFILE" :
                      this.previous().type === TokenType.WRITEFILE ? "WRITEFILE" : "CLOSEFILE";
    const lineNumber = this.previous().lineNumber;
    
    // Processa o nome do arquivo
    const filename = this.expression();
    
    let mode: "READ" | "WRITE" | "APPEND" | undefined;
    let variable: ExpressionNode | undefined;
    let data: ExpressionNode | undefined;
    
    // Processa parâmetros adicionais com base na operação
    if (operation === "OPENFILE") {
      // Consome FOR
      this.consume(TokenType.FOR, "Esperado 'FOR' após nome do arquivo");
      
      // Processa o modo
      if (this.match(TokenType.IDENTIFIER)) {
        const modeStr = this.previous().value.toUpperCase();
        if (modeStr === "READ" || modeStr === "WRITE" || modeStr === "APPEND") {
          mode = modeStr as "READ" | "WRITE" | "APPEND";
        } else {
          this.errors.push({
            lineNumber: this.previous().lineNumber,
            column: this.previous().column,
            message: "Modo de arquivo inválido. Esperado 'READ', 'WRITE' ou 'APPEND'"
          });
        }
      } else {
        this.errors.push({
          lineNumber: this.peek().lineNumber,
          column: this.peek().column,
          message: "Esperado modo de arquivo após 'FOR'"
        });
      }
    } else if (operation === "READFILE") {
      // Consome a vírgula
      this.consume(TokenType.COMMA, "Esperado ',' após nome do arquivo");
      
      // Processa a variável
      variable = this.expression();
    } else if (operation === "WRITEFILE") {
      // Consome a vírgula
      this.consume(TokenType.COMMA, "Esperado ',' após nome do arquivo");
      
      // Processa os dados
      data = this.expression();
    }
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após operação de arquivo");
    
    return {
      type: "FileOperation",
      operation,
      filename,
      mode,
      variable,
      data,
      lineNumber
    };
  }

  private assignmentStatement(): AssignmentNode {
    // Processa o lado esquerdo da atribuição
    const left = this.lvalue();
    
    // Consome o operador de atribuição
    this.consume(TokenType.ASSIGN, "Esperado '←' em atribuição");
    
    // Processa o lado direito da atribuição
    const right = this.expression();
    
    // Consome o final da linha
    this.consumeNewline("Esperado fim de linha após atribuição");
    
    return {
      type: "Assignment",
      left,
      right,
      lineNumber: left.lineNumber
    };
  }

  private lvalue(): ExpressionNode {
    // Um lvalue pode ser um identificador, acesso a array ou acesso a campo de registro
    const expr = this.primary();
    
    if (expr.type !== "Identifier" && expr.type !== "ArrayAccess" && expr.type !== "RecordAccess") {
      this.errors.push({
        lineNumber: this.previous().lineNumber,
        column: this.previous().column,
        message: "Expressão inválida para o lado esquerdo de uma atribuição"
      });
    }
    
    return expr;
  }

  private expression(): ExpressionNode {
    return this.logicalOr();
  }

  private logicalOr(): ExpressionNode {
    let expr = this.logicalAnd();
    
    while (this.match(TokenType.OR)) {
      const operator = "OR";
      const right = this.logicalAnd();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        lineNumber: expr.lineNumber
      };
    }
    
    return expr;
  }

  private logicalAnd(): ExpressionNode {
    let expr = this.equality();
    
    while (this.match(TokenType.AND)) {
      const operator = "AND";
      const right = this.equality();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        lineNumber: expr.lineNumber
      };
    }
    
    return expr;
  }

  private equality(): ExpressionNode {
    let expr = this.comparison();
    
    while (this.match(TokenType.EQUAL, TokenType.NOT_EQUAL)) {
      const operator = this.previous().type === TokenType.EQUAL ? "=" : "<>";
      const right = this.comparison();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        lineNumber: expr.lineNumber
      };
    }
    
    return expr;
  }

  private comparison(): ExpressionNode {
    let expr = this.term();
    
    while (this.match(TokenType.LESS_THAN, TokenType.GREATER_THAN, TokenType.LESS_EQUAL, TokenType.GREATER_EQUAL)) {
      const operator = this.previous().type === TokenType.LESS_THAN ? "<" :
                       this.previous().type === TokenType.GREATER_THAN ? ">" :
                       this.previous().type === TokenType.LESS_EQUAL ? "<=" : ">=";
      const right = this.term();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        lineNumber: expr.lineNumber
      };
    }
    
    return expr;
  }

  private term(): ExpressionNode {
    let expr = this.factor();
    
    while (this.match(TokenType.PLUS, TokenType.MINUS, TokenType.CONCAT)) {
      const operator = this.previous().type === TokenType.PLUS ? "+" :
                       this.previous().type === TokenType.MINUS ? "-" : "&";
      const right = this.factor();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        lineNumber: expr.lineNumber
      };
    }
    
    return expr;
  }

  private factor(): ExpressionNode {
    let expr = this.unary();
    
    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.DIV, TokenType.MOD)) {
      const operator = this.previous().type === TokenType.MULTIPLY ? "*" :
                       this.previous().type === TokenType.DIVIDE ? "/" :
                       this.previous().type === TokenType.DIV ? "DIV" : "MOD";
      const right = this.unary();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        lineNumber: expr.lineNumber
      };
    }
    
    return expr;
  }

  private unary(): ExpressionNode {
    if (this.match(TokenType.MINUS, TokenType.NOT)) {
      const operator = this.previous().type === TokenType.MINUS ? "-" : "NOT";
      const lineNumber = this.previous().lineNumber;
      const argument = this.unary();
      return {
        type: "UnaryExpression",
        operator,
        argument,
        lineNumber
      };
    }
    
    return this.call();
  }

  private call(): ExpressionNode {
    let expr = this.primary();
    
    // Processa chamadas de função, acessos a array e acessos a campos de registro
    while (true) {
      if (this.match(TokenType.LPAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.LBRACKET)) {
        expr = this.finishArrayAccess(expr);
      } else if (this.match(TokenType.DOT)) {
        expr = this.finishRecordAccess(expr);
      } else {
        break;
      }
    }
    
    return expr;
  }

  private finishCall(callee: ExpressionNode): CallExpressionNode {
    const args: ExpressionNode[] = [];
    
    // Processa os argumentos
    if (!this.check(TokenType.RPAREN)) {
      args.push(this.expression());
      
      while (this.match(TokenType.COMMA)) {
        args.push(this.expression());
      }
    }
    
    // Consome o parêntese de fechamento
    this.consume(TokenType.RPAREN, "Esperado ')' após argumentos");
    
    // Verifica se o callee é um identificador
    if (callee.type !== "Identifier") {
      this.errors.push({
        lineNumber: callee.lineNumber,
        column: 0, // Não temos a coluna exata
        message: "Apenas identificadores podem ser chamados como funções"
      });
    }
    
    return {
      type: "CallExpression",
      callee: callee as IdentifierNode,
      arguments: args,
      lineNumber: callee.lineNumber
    };
  }

  private finishArrayAccess(array: ExpressionNode): ArrayAccessNode {
    const indices: ExpressionNode[] = [];
    
    // Processa o primeiro índice
    indices.push(this.expression());
    
    // Processa índices adicionais para arrays multidimensionais
    while (this.match(TokenType.COMMA)) {
      indices.push(this.expression());
    }
    
    // Consome o colchete de fechamento
    this.consume(TokenType.RBRACKET, "Esperado ']' após índices");
    
    return {
      type: "ArrayAccess",
      arrayExpr: array,
      indices,
      lineNumber: array.lineNumber
    };
  }

  private finishRecordAccess(record: ExpressionNode): RecordAccessNode {
    // Processa o nome do campo
    const fieldName = this.consume(TokenType.IDENTIFIER, "Esperado nome do campo após '.'").value;
    
    return {
      type: "RecordAccess",
      recordExpr: record,
      fieldName,
      lineNumber: record.lineNumber
    };
  }

  private primary(): ExpressionNode {
    // Processa literais
    if (this.match(TokenType.LITERAL_INTEGER)) {
      return {
        type: "Literal",
        value: parseInt(this.previous().value),
        dataType: "INTEGER",
        lineNumber: this.previous().lineNumber
      };
    }
    
    if (this.match(TokenType.LITERAL_REAL)) {
      return {
        type: "Literal",
        value: parseFloat(this.previous().value),
        dataType: "REAL",
        lineNumber: this.previous().lineNumber
      };
    }
    
    if (this.match(TokenType.LITERAL_STRING)) {
      return {
        type: "Literal",
        value: this.previous().value,
        dataType: "STRING",
        lineNumber: this.previous().lineNumber
      };
    }
    
    if (this.match(TokenType.LITERAL_CHAR)) {
      return {
        type: "Literal",
        value: this.previous().value,
        dataType: "CHAR",
        lineNumber: this.previous().lineNumber
      };
    }
    
    if (this.match(TokenType.LITERAL_BOOLEAN)) {
      return {
        type: "Literal",
        value: this.previous().value.toUpperCase() === "TRUE",
        dataType: "BOOLEAN",
        lineNumber: this.previous().lineNumber
      };
    }
    
    // Processa identificadores
    if (this.match(TokenType.IDENTIFIER)) {
      return {
        type: "Identifier",
        name: this.previous().value,
        lineNumber: this.previous().lineNumber
      };
    }
    
    // Processa expressões entre parênteses
    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RPAREN, "Esperado ')' após expressão");
      return expr;
    }
    
    // Processa verificação de EOF
    if (this.match(TokenType.EOF)) {
      // Consome o parêntese de abertura
      this.consume(TokenType.LPAREN, "Esperado '(' após 'EOF'");
      
      // Processa o nome do arquivo
      const filename = this.expression();
      
      // Consome o parêntese de fechamento
      this.consume(TokenType.RPAREN, "Esperado ')' após nome do arquivo");
      
      return {
        type: "EOFCheck",
        filename,
        lineNumber: this.previous().lineNumber
      };
    }
    
    // Token inesperado
    this.errors.push({
      lineNumber: this.peek().lineNumber,
      column: this.peek().column,
      message: `Token inesperado: ${this.peek().value}`
    });
    
    // Avança para evitar loop infinito
    this.advance();
    
    // Retorna um nó de erro
    return {
      type: "Identifier",
      name: "ERROR",
      lineNumber: this.previous().lineNumber
    };
  }

  private consumeNewline(message: string): void {
    // Consome comentários, se houver
    if (this.match(TokenType.COMMENT)) {
      // Após um comentário, deve haver uma quebra de linha
      this.consume(TokenType.NEWLINE, message);
      return;
    }
    
    // Consome a quebra de linha
    this.consume(TokenType.NEWLINE, message);
    
    // Consome quebras de linha adicionais
    while (this.match(TokenType.NEWLINE)) {
      // Continua consumindo
    }
  }
}
