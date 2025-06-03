// src/components/pseudocode/PseudocodeCompiler.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { interpretPseudocode } from '@/app/lib/pseudocode/interpreter';
import { validatePseudocode } from '@/app/lib/pseudocode/validator';
import toast from 'react-hot-toast';
import { Play, XCircle, Trash2, Clipboard, Check, AlertTriangle } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface PseudocodeCompilerProps {
  initialCode?: string;
  readOnly?: boolean;
  onCodeChange?: (code: string) => void;
  onExecutionComplete?: (output: string[], success: boolean) => void;
  showExamples?: boolean;
  role?: 'admin' | 'teacher' | 'student';
}

const PseudocodeCompiler: React.FC<PseudocodeCompilerProps> = ({
  initialCode = '',
  readOnly = false,
  onCodeChange,
  onExecutionComplete,
  showExamples = true,
  role = 'student'
}) => {
  const [pseudocodeInput, setPseudocodeInput] = useState<string>(initialCode);
  const [interpreterOutput, setInterpreterOutput] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [runtimeErrors, setRuntimeErrors] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const { data: session } = useSession();

  // Exemplos de pseudocódigo
  const examples = {
    basic: `// Exemplo básico - Olá Mundo
DECLARE Nome : STRING
Nome ← "Mundo"
OUTPUT "Olá " & Nome`,
    
    variables: `// Exemplo de variáveis e tipos
DECLARE Idade : INTEGER
DECLARE Altura : REAL
DECLARE Inicial : CHAR
DECLARE Nome : STRING
DECLARE Aprovado : BOOLEAN

Idade ← 18
Altura ← 1.75
Inicial ← 'A'
Nome ← "Ana Silva"
Aprovado ← TRUE

OUTPUT "Nome: " & Nome
OUTPUT "Idade: " & Idade
OUTPUT "Altura: " & Altura
OUTPUT "Inicial: " & Inicial
OUTPUT "Aprovado: " & Aprovado`,
    
    ifStatement: `// Exemplo de estrutura IF
DECLARE Idade : INTEGER
Idade ← 18

IF Idade >= 18 THEN
   OUTPUT "Maior de idade"
ELSE
   OUTPUT "Menor de idade"
ENDIF`,
    
    loops: `// Exemplo de loops
// Loop FOR
OUTPUT "Contagem com FOR:"
FOR i ← 1 TO 5
   OUTPUT i
NEXT i

// Loop WHILE
OUTPUT "Contagem com WHILE:"
DECLARE contador : INTEGER
contador ← 1
WHILE contador <= 5
   OUTPUT contador
   contador ← contador + 1
ENDWHILE

// Loop REPEAT
OUTPUT "Contagem com REPEAT:"
DECLARE num : INTEGER
num ← 1
REPEAT
   OUTPUT num
   num ← num + 1
UNTIL num > 5`,
    
    arrays: `// Exemplo de arrays
DECLARE Notas : ARRAY[1:5] OF INTEGER
DECLARE Soma : INTEGER
DECLARE Media : REAL

Notas[1] ← 8
Notas[2] ← 7
Notas[3] ← 9
Notas[4] ← 6
Notas[5] ← 8

Soma ← 0
FOR i ← 1 TO 5
   Soma ← Soma + Notas[i]
NEXT i

Media ← Soma / 5
OUTPUT "Média das notas: " & Media`,
    
    procedures: `// Exemplo de procedimentos e funções
FUNCTION Quadrado(BYVAL x : INTEGER) RETURNS INTEGER
   RETURN x * x
ENDFUNCTION

PROCEDURE MostrarQuadrado(BYVAL num : INTEGER)
   OUTPUT "O quadrado de " & num & " é " & Quadrado(num)
ENDPROCEDURE

DECLARE Numero : INTEGER
Numero ← 5
CALL MostrarQuadrado(Numero)
CALL MostrarQuadrado(10)`
  };

  // Efeito para validar o código quando ele muda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateCode();
    }, 500);

    // Notifica o componente pai sobre a mudança de código
    if (onCodeChange) {
      onCodeChange(pseudocodeInput);
    }

    return () => clearTimeout(timeoutId);
  }, [pseudocodeInput]);

  // Função para validar o código
  const validateCode = () => {
    if (!pseudocodeInput.trim()) {
      setValidationErrors([]);
      return;
    }

    setIsValidating(true);
    try {
      const errors = validatePseudocode(pseudocodeInput);
      setValidationErrors(errors);
      setIsValidating(false);
    } catch (error) {
      console.error('Erro ao validar código:', error);
      setIsValidating(false);
    }
  };

  // Função para executar o código
  const handleRun = () => {
    setIsExecuting(true);
    try {
      const { output, errors } = interpretPseudocode(pseudocodeInput);

      setInterpreterOutput(output);
      setRuntimeErrors(errors);

      if (errors.length === 0) {
        // Exibe saída se bem-sucedido
        setInterpreterOutput(output);
        toast.success('Interpretação concluída com sucesso!', {
          style: {
            background: '#333',
            color: '#fff',
          },
        });
        
        // Notifica o componente pai sobre a execução bem-sucedida
        if (onExecutionComplete) {
          onExecutionComplete(output, true);
        }
      } else {
        // Exibe erros se a interpretação falhou
        setInterpreterOutput([]); // Limpa saída anterior em caso de erro
        const errorMessages = errors
          .map(err => `Linha ${err.lineNumber}: ${err.message}`)
          .join('\n');
        toast.error(`Falha na interpretação: ${errors.length} erro(s) encontrado(s).`, {
          style: {
            background: '#333',
            color: '#fff',
          },
        });
        
        // Notifica o componente pai sobre a execução com erros
        if (onExecutionComplete) {
          onExecutionComplete([], false);
        }
      }
    } catch (error) {
      console.error('Erro ao executar código:', error);
      toast.error('Ocorreu um erro ao executar o código.', {
        style: {
          background: '#333',
          color: '#fff',
        },
      });
      
      // Notifica o componente pai sobre a execução com erros
      if (onExecutionComplete) {
        onExecutionComplete([], false);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  // Função para limpar o editor e a saída
  const handleClear = () => {
    setPseudocodeInput('');
    setInterpreterOutput([]);
    setRuntimeErrors([]);
    setValidationErrors([]);
    toast('Áreas limpas.', {
      icon: '🧹',
      style: {
        background: '#333',
        color: '#fff',
      },
    });
  };

  // Função para copiar a saída
  const handleCopyOutput = () => {
    const outputToCopy = runtimeErrors.length > 0
      ? runtimeErrors.map(err => `Erro (Linha ${err.lineNumber}): ${err.message}`).join('\n')
      : interpreterOutput.join('\n');

    if (!outputToCopy) {
      toast.error('Nada para copiar.', {
        style: {
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }
    
    navigator.clipboard.writeText(outputToCopy)
      .then(() => {
        toast.success('Resultado copiado para a área de transferência!', {
          style: {
            background: '#333',
            color: '#fff',
          },
        });
      })
      .catch(err => {
        toast.error('Falha ao copiar o resultado.', {
          style: {
            background: '#333',
            color: '#fff',
          },
        });
        console.error('Erro ao copiar:', err);
      });
  };

  // Função para carregar um exemplo
  const loadExample = (exampleKey: keyof typeof examples) => {
    setPseudocodeInput(examples[exampleKey]);
    toast.success(`Exemplo carregado: ${exampleKey}`, {
      style: {
        background: '#333',
        color: '#fff',
      },
    });
  };

  // Determina o conteúdo e estilo para a área de saída
  const outputAreaContent = runtimeErrors.length > 0
    ? `Erros de Execução:\n${runtimeErrors.map(err => `Linha ${err.lineNumber}: ${err.message}`).join('\n')}`
    : interpreterOutput.join('\n');

  const outputAreaClassName = `w-full p-3 border rounded-md font-mono text-sm bg-fluency-pages-light dark:bg-fluency-pages-dark ${
    runtimeErrors.length > 0 
      ? 'border-fluency-red-500 dark:border-fluency-red-400 text-fluency-red-700 dark:text-fluency-red-300' 
      : 'border-fluency-gray-300 dark:border-fluency-gray-600 text-fluency-text-light dark:text-fluency-text-dark'
  } placeholder-fluency-gray-400 dark:placeholder-fluency-gray-500`;

  // Renderiza os erros de validação
  const renderValidationErrors = () => {
    if (validationErrors.length === 0) return null;

    return (
      <div className="mt-2 text-fluency-red-600 dark:text-fluency-red-400 text-sm">
        <div className="flex items-center mb-1">
          <AlertTriangle size={16} className="mr-1" />
          <span className="font-semibold">Avisos de validação:</span>
        </div>
        <ul className="list-disc pl-5 space-y-1">
          {validationErrors.slice(0, 5).map((error, index) => (
            <li key={index}>
              Linha {error.lineNumber}: {error.message}
            </li>
          ))}
          {validationErrors.length > 5 && (
            <li>...e mais {validationErrors.length - 5} avisos.</li>
          )}
        </ul>
      </div>
    );
  };

  // Renderiza os exemplos
  const renderExamples = () => {
    if (!showExamples) return null;

    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2 text-fluency-gray-700 dark:text-fluency-gray-300">
          Exemplos:
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(examples).map((key) => (
            <button
              key={key}
              onClick={() => loadExample(key as keyof typeof examples)}
              className="px-2 py-1 text-xs bg-fluency-blue-100 dark:bg-fluency-blue-900 text-fluency-blue-800 dark:text-fluency-blue-200 rounded hover:bg-fluency-blue-200 dark:hover:bg-fluency-blue-800 transition-colors"
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Verifica permissões baseadas no papel
  const canExecute = role === 'admin' || role === 'teacher' || role === 'student';
  const canEdit = !readOnly && (role === 'admin' || role === 'teacher' || role === 'student');

  return (
    <div className="p-4 rounded-lg shadow-md bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark font-sans">
      <h2 className="text-xl font-semibold mb-4 text-fluency-blue-700 dark:text-fluency-blue-300">
        Compilador de Pseudocódigo Cambridge
      </h2>

      {/* Área de Entrada */}
      <div className="mb-4">
        <label htmlFor="pseudocode-input" className="block text-sm font-medium mb-1 text-fluency-gray-700 dark:text-fluency-gray-300">
          Seu Pseudocódigo:
        </label>
        <textarea
          id="pseudocode-input"
          rows={10}
          className={`w-full p-3 border rounded-md font-mono text-sm bg-fluency-pages-light dark:bg-fluency-pages-dark border-fluency-gray-300 dark:border-fluency-gray-600 focus:ring-fluency-blue-500 focus:border-fluency-blue-500 placeholder-fluency-gray-400 dark:placeholder-fluency-gray-500 text-fluency-text-light dark:text-fluency-text-dark ${
            !canEdit ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          placeholder={`DECLARE Nome : STRING\nNome ← "Mundo"\nOUTPUT "Olá " & Nome // Exemplo`}
          value={pseudocodeInput}
          onChange={(e) => setPseudocodeInput(e.target.value)}
          spellCheck="false"
          readOnly={!canEdit}
        />
        {renderValidationErrors()}
      </div>

      {/* Botões de Controle */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={handleRun}
          disabled={!canExecute || isExecuting}
          className={`flex items-center px-4 py-2 bg-fluency-green-600 hover:bg-fluency-green-700 text-white rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fluency-green-500 dark:bg-fluency-green-500 dark:hover:bg-fluency-green-600 dark:focus:ring-offset-fluency-bg-dark ${
            !canExecute || isExecuting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isExecuting ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Executando...
            </>
          ) : (
            <>
              <Play size={18} className="mr-2" />
              Executar
            </>
          )}
        </button>
        
        <button
          onClick={handleClear}
          disabled={!canEdit || !pseudocodeInput}
          className={`flex items-center px-4 py-2 bg-fluency-red-600 hover:bg-fluency-red-700 text-white rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fluency-red-500 dark:bg-fluency-red-500 dark:hover:bg-fluency-red-600 dark:focus:ring-offset-fluency-bg-dark ${
            !canEdit || !pseudocodeInput ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Trash2 size={18} className="mr-2" />
          Limpar
        </button>
        
        <button
          onClick={handleCopyOutput}
          disabled={!interpreterOutput.length && !runtimeErrors.length}
          title="Copiar Resultado"
          className={`flex items-center px-3 py-2 bg-fluency-gray-500 hover:bg-fluency-gray-600 text-white rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fluency-gray-400 dark:bg-fluency-gray-600 dark:hover:bg-fluency-gray-700 dark:focus:ring-offset-fluency-bg-dark ${
            !interpreterOutput.length && !runtimeErrors.length ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Clipboard size={18} />
        </button>
        
        {/* Indicador de validação */}
        {isValidating ? (
          <div className="flex items-center text-fluency-gray-500 dark:text-fluency-gray-400">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-fluency-gray-500 dark:border-fluency-gray-400 border-t-transparent rounded-full"></div>
            Validando...
          </div>
        ) : validationErrors.length === 0 && pseudocodeInput.trim() ? (
          <div className="flex items-center text-fluency-green-600 dark:text-fluency-green-400">
            <Check size={18} className="mr-1" />
            Código válido
          </div>
        ) : null}
      </div>

      {/* Área de Saída/Erro */}
      <div className="mt-4">
        <label htmlFor="interpreter-output" className="block text-sm font-medium mb-1 text-fluency-gray-700 dark:text-fluency-gray-300">
          Resultado da Execução / Erros:
        </label>
        <textarea
          id="interpreter-output"
          rows={8}
          readOnly
          className={outputAreaClassName}
          placeholder="A saída da execução ou os erros aparecerão aqui..."
          value={outputAreaContent}
        />
      </div>

      {/* Exemplos */}
      {renderExamples()}

      {/* Nota sobre funcionalidades */}
      <p className="text-xs text-fluency-gray-500 dark:text-fluency-gray-400 mt-4">
        Este compilador implementa o pseudocódigo Cambridge conforme especificado no guia 9618 para exames de 2026.
        Suporta todas as estruturas de controle (IF, CASE, FOR, WHILE, REPEAT), tipos de dados (INTEGER, REAL, STRING, CHAR, BOOLEAN),
        arrays, procedimentos, funções, e operações de arquivo.
      </p>
      
      {/* Informações de usuário */}
      {session && (
        <div className="mt-4 text-xs text-fluency-gray-500 dark:text-fluency-gray-400">
          Conectado como: {session.user?.name || session.user?.email} ({role})
        </div>
      )}
    </div>
  );
};

export default PseudocodeCompiler;
