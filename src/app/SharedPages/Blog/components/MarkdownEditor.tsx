'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownEditorProps {
  content: string
  setContent: (content: string) => void
}

export default function MarkdownEditor({ content, setContent }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
      <div className="flex border-b border-gray-300 dark:border-gray-600">
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className={`px-4 py-2 ${!showPreview ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className={`px-4 py-2 ${showPreview ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
        >
          Visualização
        </button>
      </div>
      
      {!showPreview ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-96 p-4 bg-white dark:bg-gray-700 focus:outline-none"
          placeholder="Escreva seu conteúdo em Markdown aqui..."
        />
      ) : (
        <div className="w-full h-96 p-4 bg-white dark:bg-gray-700 overflow-auto prose dark:prose-invert max-w-none">
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          ) : (
            <p className="text-gray-400">Prévia do conteúdo aparecerá aqui...</p>
          )}
        </div>
      )}
      
      <div className="bg-gray-50 dark:bg-gray-800 p-2 border-t border-gray-300 dark:border-gray-600">
        <details className="text-sm text-gray-600 dark:text-gray-400">
          <summary className="cursor-pointer">Guia de Markdown</summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <p><code># Título</code> - Título grande</p>
              <p><code>## Subtítulo</code> - Subtítulo</p>
              <p><code>**texto**</code> - <strong>Negrito</strong></p>
              <p><code>*texto*</code> - <em>Itálico</em></p>
            </div>
            <div>
              <p><code>[link](url)</code> - <a href="#" className="text-blue-500">Link</a></p>
              <p><code>![alt](url)</code> - Imagem</p>
              <p><code>- item</code> - Lista</p>
              <p><code>\`código\`</code> - <code>Código</code></p>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}

