'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/app/firebase'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import Image from 'next/image'
import SpinningLoader from '@/app/ui/Animations/SpinningComponent'
import FluencyButton from '@/app/ui/Components/Button/button'
import { ArrowLeft } from 'lucide-react'

type Blog = {
  id: string
  title: string
  content: string
  tags?: string[]
  level: string
  language: string
  coverUrl?: string
  createdAt?: { seconds: number }
}

export default function BlogPostPage() {
  const [id, setId] = useState<string | null>(null)
  const [blog, setBlog] = useState<Blog | null>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlId = params.get('id')
    setId(urlId)
  }, [])

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return
      try {
        const docRef = doc(db, 'blogs', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setBlog({ id: docSnap.id, ...docSnap.data() } as Blog)
        } else {
          console.log('Post não encontrado!')
        }
      } catch (error) {
        console.error('Erro ao buscar post:', error)
      }
    }
    fetchBlog()
  }, [id])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <SpinningLoader />
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Post não encontrado</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            O post que você está procurando não existe ou foi removido.
          </p>
          <Link href="/" passHref>
            <FluencyButton variant="confirm" className="w-full">
              Voltar para a página inicial
            </FluencyButton>
          </Link>
        </div>
      </div>
    )
  }

  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt.seconds * 1000).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

  const headerHeight = 300 // altura total da imagem
  const fadeOutStart = 100
  const fadeOutEnd = 200
  const opacity = scrollY < fadeOutStart
    ? 1
    : scrollY > fadeOutEnd
    ? 0
    : 1 - (scrollY - fadeOutStart) / (fadeOutEnd - fadeOutStart)

  return (
    <div className="relative min-h-screen ">
      {/* Imagem de capa fixa no topo */}
      {blog.coverUrl && (
        <div
          className="fixed top-0 left-0 w-full z-0 overflow-hidden"
          style={{
            height: `${headerHeight}px`,
            opacity,
            transition: 'opacity 0.2s ease-out',
          }}
        >
          <Image
            src={blog.coverUrl}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Conteúdo cobrindo a imagem ao rolar */}
      <article className="relative z-10 pt-[300px] max-w-3xl mx-auto px-4 pb-20">
        <header className="mb-10">
            <Link href="#" onClick={() => window.history.back()} className="inline-flex items-center text-fluencyBlue hover:underline mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
            </Link>

          <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="bg-fluencyBlue/10 text-fluencyBlue dark:text-fluencyBlue-200 px-3 py-1 rounded-full font-medium">
              {blog.language}
            </span>
            <span className="bg-fluencyGreen/10 text-fluencyGreen dark:text-fluencyGreen-200 px-3 py-1 rounded-full font-medium">
              {blog.level}
            </span>
            {formattedDate && (
              <span className="ml-auto italic">{formattedDate}</span>
            )}
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
            {blog.title}
          </h1>

          {(blog.tags ?? []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {(blog.tags ?? []).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <section className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-a:text-fluencyBlue hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md prose-blockquote:border-l-4 prose-blockquote:border-fluencyBlue prose-blockquote:bg-gray-100 dark:prose-blockquote:bg-gray-800 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:px-2 prose-code:py-1 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:rounded prose-code:text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {blog.content}
          </ReactMarkdown>
        </section>
      </article>
    </div>
  )
}
