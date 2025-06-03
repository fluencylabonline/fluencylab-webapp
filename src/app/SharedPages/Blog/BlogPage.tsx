'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDocsFromServer,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/app/firebase'
import BlogCard from './BlogCard'

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

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterLanguage, setFilterLanguage] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [search, setSearch] = useState('')
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const [availableLevels, setAvailableLevels] = useState<string[]>([])

  const fetchFilters = async () => {
    try {
      const snapshot = await getDocsFromServer(collection(db, 'blogs'))
      const langs = new Set<string>()
      const levels = new Set<string>()
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as Blog
        langs.add(data.language)
        levels.add(data.level)
      })
      setAvailableLanguages(Array.from(langs).sort())
      setAvailableLevels(Array.from(levels).sort())
    } catch (error) {
      console.error("Erro ao buscar filtros:", error)
    }
  }

  const fetchBlogs = async (isLoadMore = false) => {
    setLoading(true)
    try {
      let q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(6))
      if (isLoadMore && lastDoc) {
        q = query(q, startAfter(lastDoc))
      }

      const snapshot = await getDocs(q)
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Blog[]

      if (isLoadMore) {
        setBlogs(prev => [...prev, ...docs])
      } else {
        setBlogs(docs)
      }
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null)
    } catch (error) {
      console.error("Erro ao buscar blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFilters()
    fetchBlogs()
  }, [])

  const filtered = blogs.filter(b =>
    (!filterLanguage || b.language === filterLanguage) &&
    (!filterLevel || b.level === filterLevel) &&
    (!search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.content.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-5xl mx-auto px-4 pb-32 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="md:col-span-2 relative">
          <input
            className="w-full bg-fluency-pages-light dark:bg-fluency-pages-dark px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Buscar artigo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="bg-fluency-pages-light dark:bg-fluency-pages-dark px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filterLanguage}
          onChange={(e) => setFilterLanguage(e.target.value)}
        >
          <option value="">Todos idiomas</option>
          {availableLanguages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>

        <select
          className="bg-fluency-pages-light dark:bg-fluency-pages-dark px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
        >
          <option value="">Todos níveis</option>
          {availableLevels.map(lvl => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum artigo encontrado.</h3>
          <p className="text-gray-600">Tente ajustar seus filtros ou pesquise outros termos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}

      {lastDoc && (
        <div className="text-center mt-6">
          <button
            onClick={() => fetchBlogs(true)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 hover:dark:bg-gray-900 rounded transition-colors"
          >
            Carregar mais
          </button>
        </div>
      )}
    </div>
  )
}
