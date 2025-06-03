// src/lib/pseudocode/types.ts

/**
 * Definições de tipos para o compilador de pseudocódigo Cambridge
 * 
 * Este arquivo contém as interfaces e tipos utilizados pelo compilador,
 * incluindo nós da árvore sintática abstrata (AST) e estruturas de dados.
 */

// Tipos de dados básicos do pseudocódigo Cambridge
export type PseudocodeType = "INTEGER" | "REAL" | "STRING" | "CHAR" | "BOOLEAN" | "DATE" | "ARRAY" | "RECORD" | "POINTER" | "FILE" | "NULL" | "UNKNOWN";

// Interface base para todos os nós da AST
export interface AstNode {
  type: string;
  lineNumber: number;
}

// Nós de expressão
export interface ExpressionNode extends AstNode {
  // Propriedade comum para todos os nós de expressão
}

// Nó para identificadores (variáveis, constantes, etc.)
export interface IdentifierNode extends ExpressionNode {
  type: "Identifier";
  name: string;
}

// Nó para literais (números, strings, etc.)
export interface LiteralNode extends ExpressionNode {
  type: "Literal";
  value: any;
  dataType: PseudocodeType;
}

// Nó para expressões binárias (a + b, x > y, etc.)
export interface BinaryExpressionNode extends ExpressionNode {
  type: "BinaryExpression";
  operator: string;
  left: ExpressionNode;
  right: ExpressionNode;
}

// Nó para expressões unárias (NOT x, -y, etc.)
export interface UnaryExpressionNode extends ExpressionNode {
  type: "UnaryExpression";
  operator: string;
  argument: ExpressionNode;
}

// Nó para acesso a arrays (arr[i])
export interface ArrayAccessNode extends ExpressionNode {
  type: "ArrayAccess";
  arrayExpr: ExpressionNode;
  indices: ExpressionNode[];
}

// Nó para acesso a campos de registros (person.name)
export interface RecordAccessNode extends ExpressionNode {
  type: "RecordAccess";
  recordExpr: ExpressionNode;
  fieldName: string;
}

// Nó para chamada de função (Calc(x, y))
export interface CallExpressionNode extends ExpressionNode {
  type: "CallExpression";
  callee: IdentifierNode;
  arguments: ExpressionNode[];
}

// Nós de declaração
export interface StatementNode extends AstNode {
  // Propriedade comum para todos os nós de declaração
}

// Nó para declaração de variável (DECLARE x : INTEGER)
export interface VariableDeclarationNode extends StatementNode {
  type: "VariableDeclaration";
  identifier: string;
  dataType: DataTypeNode | ArrayTypeNode | RecordTypeIdentifierNode;
  isConstant: boolean;
}

// Nó para atribuição (x ← 10)
export interface AssignmentNode extends StatementNode {
  type: "Assignment";
  left: ExpressionNode;
  right: ExpressionNode;
}

// Nó para estrutura IF (IF...THEN...ELSE...ENDIF)
export interface IfStatementNode extends StatementNode {
  type: "IfStatement";
  condition: ExpressionNode;
  thenBody: StatementNode[];
  elseBody?: StatementNode[];
}

// Nó para estrutura CASE (CASE OF...ENDCASE)
export interface CaseStatementNode extends StatementNode {
  type: "CaseStatement";
  expression: ExpressionNode;
  cases: CaseClauseNode[];
  otherwise?: StatementNode[];
}

// Nó para cláusula de CASE
export interface CaseClauseNode extends AstNode {
  type: "CaseClause";
  value: ExpressionNode | { from: ExpressionNode, to: ExpressionNode };
  body: StatementNode[];
}

// Nó para loop FOR (FOR...TO...NEXT)
export interface ForLoopNode extends StatementNode {
  type: "ForLoop";
  variable: IdentifierNode;
  start: ExpressionNode;
  end: ExpressionNode;
  step?: ExpressionNode;
  body: StatementNode[];
}

// Nó para loop WHILE (WHILE...ENDWHILE)
export interface WhileLoopNode extends StatementNode {
  type: "WhileLoop";
  condition: ExpressionNode;
  body: StatementNode[];
}

// Nó para loop REPEAT (REPEAT...UNTIL)
export interface RepeatLoopNode extends StatementNode {
  type: "RepeatLoop";
  condition: ExpressionNode;
  body: StatementNode[];
}

// Nó para comando INPUT
export interface InputNode extends StatementNode {
  type: "Input";
  variable: ExpressionNode;
}

// Nó para comando OUTPUT
export interface OutputNode extends StatementNode {
  type: "Output";
  expressions: ExpressionNode[];
}

// Nó para definição de procedimento
export interface ProcedureDefinitionNode extends StatementNode {
  type: "ProcedureDefinition";
  name: string;
  parameters: ParameterNode[];
  body: StatementNode[];
}

// Nó para definição de função
export interface FunctionDefinitionNode extends StatementNode {
  type: "FunctionDefinition";
  name: string;
  parameters: ParameterNode[];
  returnType: DataTypeNode | ArrayTypeNode | RecordTypeIdentifierNode;
  body: StatementNode[];
}

// Nó para parâmetro de procedimento/função
export interface ParameterNode extends AstNode {
  type: "Parameter";
  name: string;
  dataType: DataTypeNode | ArrayTypeNode | RecordTypeIdentifierNode;
  mode: "BYVAL" | "BYREF";
}

// Nó para chamada de procedimento (CALL Proc(x, y))
export interface ProcedureCallNode extends StatementNode {
  type: "ProcedureCall";
  name: string;
  arguments: ExpressionNode[];
}

// Nó para comando RETURN
export interface ReturnNode extends StatementNode {
  type: "Return";
  expression?: ExpressionNode;
}

// Nó para tipo de dados básico
export interface DataTypeNode extends AstNode {
  type: "DataType";
  name: PseudocodeType;
}

// Nó para tipo de array
export interface ArrayTypeNode extends AstNode {
  type: "ArrayType";
  elementType: DataTypeNode | RecordTypeIdentifierNode;
  dimensions: ArrayDimensionNode[];
}

// Nó para dimensão de array
export interface ArrayDimensionNode extends AstNode {
  type: "ArrayDimension";
  lowerBound: ExpressionNode;
  upperBound: ExpressionNode;
}

// Nó para identificador de tipo de registro
export interface RecordTypeIdentifierNode extends AstNode {
  type: "RecordTypeIdentifier";
  name: string;
}

// Nó para definição de tipo de registro
export interface RecordTypeDefinitionNode extends StatementNode {
  type: "RecordTypeDefinition";
  name: string;
  fields: RecordFieldNode[];
}

// Nó para campo de registro
export interface RecordFieldNode extends AstNode {
  type: "RecordField";
  name: string;
  dataType: DataTypeNode | ArrayTypeNode | RecordTypeIdentifierNode;
}

// Nó para operações de arquivo
export interface FileOperationNode extends StatementNode {
  type: "FileOperation";
  operation: "OPENFILE" | "READFILE" | "WRITEFILE" | "CLOSEFILE";
  filename: ExpressionNode;
  mode?: "READ" | "WRITE" | "APPEND"; // Para OPENFILE
  variable?: ExpressionNode; // Para READFILE
  data?: ExpressionNode; // Para WRITEFILE
}

// Nó para verificação de EOF
export interface EOFCheckNode extends ExpressionNode {
  type: "EOFCheck";
  filename: ExpressionNode;
}

// Nó para programa completo
export interface ProgramNode extends AstNode {
  type: "Program";
  body: StatementNode[];
}

// Interfaces para erros
export interface SyntaxError {
  lineNumber: number;
  column: number;
  message: string;
}

export interface RuntimeError {
  lineNumber: number;
  message: string;
}

// Interface para resultado da interpretação
export interface InterpretResult {
  output: string[];
  errors: RuntimeError[];
}

// Interface para informações de símbolo na tabela de símbolos
export interface SymbolInfo {
  type: AstNode;
  value: any;
  isConstant?: boolean;
  isParamByRef?: boolean;
  refTarget?: { scope: any; name: string };
  arrayBounds?: { lower: number; upper: number }[];
  arrayItemType?: AstNode;
  recordDefinition?: any;
  procedureDefinition?: any;
  functionDefinition?: any;
}

// Interface para quadro de chamada (call frame)
export interface CallFrame {
  scope: any; // SymbolTable
  procedureOrFunction?: any;
  returnAddress?: number;
  returnValue?: any;
}

// Interface para estado do interpretador
export interface InterpreterState {
  symbolTable: any; // SymbolTable
  output: string[];
  callStack: CallFrame[];
  globalScope: any; // SymbolTable
  returnValue?: any;
  returnSignal: boolean;
  fileSystem: Map<string, any>; // Map<filename, OpenFile>
}

// Interface para arquivo aberto
export interface OpenFile {
  content: string[]; // Linhas do arquivo
  readPointer: number; // Número da linha atual para READFILE
  mode: "READ" | "WRITE" | "APPEND";
}

// Interface para erro do interpretador
export interface InterpreterError {
  lineNumber: number;
  message: string;
  type: "Syntax" | "Runtime";
}
