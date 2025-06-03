// src/lib/pseudocode/lexer.ts

/**
 * Lexer (Analisador Léxico) para Pseudocódigo Cambridge
 * 
 * Este módulo implementa um analisador léxico completo para o pseudocódigo Cambridge,
 * convertendo o texto de entrada em tokens que podem ser processados pelo parser.
 */

// Definição dos tipos de tokens
export enum TokenType {
  // Palavras-chave
  DECLARE, CONSTANT, TYPE, ENDTYPE, ARRAY, OF,
  IF, THEN, ELSE, ENDIF, CASE, OTHERWISE, ENDCASE,
  FOR, TO, STEP, NEXT,
  WHILE, ENDWHILE,
  REPEAT, UNTIL,
  PROCEDURE, ENDPROCEDURE, FUNCTION, ENDFUNCTION, RETURNS, RETURN, CALL, BYVAL, BYREF,
  INPUT, OUTPUT,
  OPENFILE, READFILE, WRITEFILE, CLOSEFILE, EOF,
  
  // Tipos de dados
  INTEGER, REAL, CHAR, STRING, BOOLEAN, DATE,
  
  // Operadores
  ASSIGN, // ←
  PLUS, MINUS, MULTIPLY, DIVIDE, DIV, MOD,
  EQUAL, NOT_EQUAL, LESS_THAN, GREATER_THAN, LESS_EQUAL, GREATER_EQUAL,
  AND, OR, NOT,
  CONCAT, // &
  
  // Literais
  LITERAL_INTEGER, LITERAL_REAL, LITERAL_STRING, LITERAL_CHAR, LITERAL_BOOLEAN, LITERAL_DATE,
  
  // Símbolos
  COLON, COMMA, LPAREN, RPAREN, LBRACKET, RBRACKET, CARET, DOT,
  
  // Identificador
  IDENTIFIER,
  
  // Outros
  COMMENT, NEWLINE, WHITESPACE, UNKNOWN, EOF_TOKEN
}

// Interface para representar um token
export interface Token {
  type: TokenType;
  value: string;
  lineNumber: number;
  column: number;
}

// Classe Lexer para análise léxica
export class Lexer {
  private code: string;
  private position: number = 0;
  private lineNumber: number = 1;
  private column: number = 1;
  
  // Mapeamento de palavras-chave para tipos de tokens
  private static KEYWORDS: { [key: string]: TokenType } = {
    "DECLARE": TokenType.DECLARE,
    "CONSTANT": TokenType.CONSTANT,
    "TYPE": TokenType.TYPE,
    "ENDTYPE": TokenType.ENDTYPE,
    "ARRAY": TokenType.ARRAY,
    "OF": TokenType.OF,
    "IF": TokenType.IF,
    "THEN": TokenType.THEN,
    "ELSE": TokenType.ELSE,
    "ENDIF": TokenType.ENDIF,
    "CASE": TokenType.CASE,
    "OTHERWISE": TokenType.OTHERWISE,
    "ENDCASE": TokenType.ENDCASE,
    "FOR": TokenType.FOR,
    "TO": TokenType.TO,
    "STEP": TokenType.STEP,
    "NEXT": TokenType.NEXT,
    "WHILE": TokenType.WHILE,
    "ENDWHILE": TokenType.ENDWHILE,
    "REPEAT": TokenType.REPEAT,
    "UNTIL": TokenType.UNTIL,
    "PROCEDURE": TokenType.PROCEDURE,
    "ENDPROCEDURE": TokenType.ENDPROCEDURE,
    "FUNCTION": TokenType.FUNCTION,
    "ENDFUNCTION": TokenType.ENDFUNCTION,
    "RETURNS": TokenType.RETURNS,
    "RETURN": TokenType.RETURN,
    "CALL": TokenType.CALL,
    "BYVAL": TokenType.BYVAL,
    "BYREF": TokenType.BYREF,
    "INPUT": TokenType.INPUT,
    "OUTPUT": TokenType.OUTPUT,
    "OPENFILE": TokenType.OPENFILE,
    "READFILE": TokenType.READFILE,
    "WRITEFILE": TokenType.WRITEFILE,
    "CLOSEFILE": TokenType.CLOSEFILE,
    "EOF": TokenType.EOF,
    "DIV": TokenType.DIV,
    "MOD": TokenType.MOD,
    "AND": TokenType.AND,
    "OR": TokenType.OR,
    "NOT": TokenType.NOT,
    "TRUE": TokenType.LITERAL_BOOLEAN,
    "FALSE": TokenType.LITERAL_BOOLEAN,
    // Tipos de dados
    "INTEGER": TokenType.INTEGER,
    "REAL": TokenType.REAL,
    "CHAR": TokenType.CHAR,
    "STRING": TokenType.STRING,
    "BOOLEAN": TokenType.BOOLEAN,
    "DATE": TokenType.DATE
  };
  
  constructor(code: string) {
    this.code = code;
  }
  
  // Métodos auxiliares para verificação de caracteres
  private isAlpha(char: string): boolean {
    return /^[a-zA-Z_]$/.test(char);
  }
  
  private isDigit(char: string): boolean {
    return /^[0-9]$/.test(char);
  }
  
  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
  
  private isWhitespace(char: string): boolean {
    return /\s/.test(char) && char !== '\n';
  }
  
  // Avança para o próximo caractere
  private advance(): string {
    const char = this.code[this.position++];
    if (char === '\n') {
      this.lineNumber++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }
  
  // Verifica o caractere atual sem avançar
  private peek(): string {
    return this.code[this.position] || '\0';
  }
  
  // Verifica o próximo caractere sem avançar
  private peekNext(): string {
    return this.code[this.position + 1] || '\0';
  }
  
  // Cria um token com o tipo e valor especificados
  private createToken(type: TokenType, value: string, line?: number, col?: number): Token {
    return {
      type,
      value,
      lineNumber: line ?? this.lineNumber,
      column: col ?? this.column - value.length
    };
  }
  
  // Obtém o próximo token do código fonte
  public getNextToken(): Token {
    // Enquanto houver caracteres para processar
    while (this.position < this.code.length) {
      const startPos = this.position;
      const startLine = this.lineNumber;
      const startCol = this.column;
      const char = this.advance();
      
      // Ignora espaços em branco
      if (this.isWhitespace(char)) {
        continue;
      }
      
      // Processa quebras de linha
      if (char === '\n') {
        return this.createToken(TokenType.NEWLINE, '\n', startLine, startCol);
      }
      
      // Processa comentários
      if (char === '/' && this.peek() === '/') {
        let comment = char;
        while (this.peek() !== '\n' && this.peek() !== '\0') {
          comment += this.advance();
        }
        return this.createToken(TokenType.COMMENT, comment, startLine, startCol);
      }
      
      // Processa símbolos
      if (char === ':') return this.createToken(TokenType.COLON, char, startLine, startCol);
      if (char === ',') return this.createToken(TokenType.COMMA, char, startLine, startCol);
      if (char === '(') return this.createToken(TokenType.LPAREN, char, startLine, startCol);
      if (char === ')') return this.createToken(TokenType.RPAREN, char, startLine, startCol);
      if (char === '[') return this.createToken(TokenType.LBRACKET, char, startLine, startCol);
      if (char === ']') return this.createToken(TokenType.RBRACKET, char, startLine, startCol);
      if (char === '^') return this.createToken(TokenType.CARET, char, startLine, startCol);
      if (char === '.') return this.createToken(TokenType.DOT, char, startLine, startCol);
      
      // Processa operadores
      if (char === '+') return this.createToken(TokenType.PLUS, char, startLine, startCol);
      if (char === '-') return this.createToken(TokenType.MINUS, char, startLine, startCol);
      if (char === '*') return this.createToken(TokenType.MULTIPLY, char, startLine, startCol);
      if (char === '/') return this.createToken(TokenType.DIVIDE, char, startLine, startCol);
      if (char === '&') return this.createToken(TokenType.CONCAT, char, startLine, startCol);
      if (char === '=') return this.createToken(TokenType.EQUAL, char, startLine, startCol);
      if (char === '←') return this.createToken(TokenType.ASSIGN, char, startLine, startCol);
      
      // Processa operadores compostos
      if (char === '<') {
        if (this.peek() === '>') {
          this.advance();
          return this.createToken(TokenType.NOT_EQUAL, "<>", startLine, startCol);
        } else if (this.peek() === '=') {
          this.advance();
          return this.createToken(TokenType.LESS_EQUAL, "<=", startLine, startCol);
        }
        return this.createToken(TokenType.LESS_THAN, "<", startLine, startCol);
      }
      
      if (char === '>') {
        if (this.peek() === '=') {
          this.advance();
          return this.createToken(TokenType.GREATER_EQUAL, ">=", startLine, startCol);
        }
        return this.createToken(TokenType.GREATER_THAN, ">", startLine, startCol);
      }
      
      // Processa strings
      if (char === '"') {
        let value = "";
        while (this.peek() !== '"' && this.peek() !== '\0' && this.peek() !== '\n') {
          value += this.advance();
        }
        
        if (this.peek() === '"') {
          this.advance(); // Consome o fechamento das aspas
          return this.createToken(TokenType.LITERAL_STRING, value, startLine, startCol);
        } else {
          // String não terminada
          return this.createToken(TokenType.UNKNOWN, this.code.substring(startPos, this.position), startLine, startCol);
        }
      }
      
      // Processa caracteres
      if (char === '\'') {
        let value = "";
        if (this.peek() !== '\'' && this.peek() !== '\0' && this.peek() !== '\n') {
          value = this.advance();
        }
        
        if (this.peek() === '\'') {
          this.advance(); // Consome o fechamento da aspa
          return this.createToken(TokenType.LITERAL_CHAR, value, startLine, startCol);
        } else {
          // Caractere não terminado
          return this.createToken(TokenType.UNKNOWN, this.code.substring(startPos, this.position), startLine, startCol);
        }
      }
      
      // Processa números
      if (this.isDigit(char)) {
        let value = char;
        let isReal = false;
        
        // Consome dígitos
        while (this.isDigit(this.peek())) {
          value += this.advance();
        }
        
        // Verifica se é um número real
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
          isReal = true;
          value += this.advance(); // Consome o ponto
          
          // Consome dígitos após o ponto
          while (this.isDigit(this.peek())) {
            value += this.advance();
          }
        }
        
        return this.createToken(
          isReal ? TokenType.LITERAL_REAL : TokenType.LITERAL_INTEGER,
          value,
          startLine,
          startCol
        );
      }
      
      // Processa identificadores e palavras-chave
      if (this.isAlpha(char)) {
        let value = char;
        
        // Consome caracteres alfanuméricos
        while (this.isAlphaNumeric(this.peek())) {
          value += this.advance();
        }
        
        // Verifica se é uma palavra-chave
        const upperValue = value.toUpperCase();
        if (upperValue in Lexer.KEYWORDS) {
          return this.createToken(Lexer.KEYWORDS[upperValue], value, startLine, startCol);
        }
        
        // É um identificador
        return this.createToken(TokenType.IDENTIFIER, value, startLine, startCol);
      }
      
      // Caractere desconhecido
      return this.createToken(TokenType.UNKNOWN, char, startLine, startCol);
    }
    
    // Fim do arquivo
    return this.createToken(TokenType.EOF_TOKEN, "", this.lineNumber, this.column);
  }
  
  // Tokeniza todo o código fonte
  public tokenize(): Token[] {
    const tokens: Token[] = [];
    let token = this.getNextToken();
    
    while (token.type !== TokenType.EOF_TOKEN) {
      tokens.push(token);
      token = this.getNextToken();
    }
    
    tokens.push(token); // Adiciona o token EOF
    return tokens;
  }
}
