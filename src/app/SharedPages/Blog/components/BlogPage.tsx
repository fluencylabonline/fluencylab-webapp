'use client'

import { SetStateAction, useEffect, useState } from 'react'
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
  deleteDoc, // Import deleteDoc
  doc,       // Import doc
} from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'; // Import storage functions
import { db, storage } from '@/app/firebase' // Make sure to export `storage` from your firebase config
import BlogCard from './BlogCard'
import FluencyButton from '@/app/ui/Components/Button/button'
import FluencyInput from '@/app/ui/Components/Input/input'
import FluencySelect from '@/app/ui/Components/Input/select'
import { useSession } from 'next-auth/react'; // Import useSession
import ConfirmationModal from '@/app/ui/Components/ModalComponents/confirmation';
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  // State for the confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<{ id: string; coverUrl?: string } | null>(null);

  const { data: session } = useSession(); // Get the session
  const isAdmin = session?.user?.role === 'admin'; // Check if the user is an admin

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

  // Modified handleDelete function to open the modal
  const handleDelete = async (blogId: string, coverUrl?: string): Promise<void> => {
    setBlogToDelete({ id: blogId, coverUrl });
    setIsModalOpen(true);
  };

  // Function to execute the deletion after confirmation
  const confirmDelete = async () => {
    if (!blogToDelete) return; // Should not happen if modal is open

    const { id: blogId, coverUrl } = blogToDelete;
    setIsModalOpen(false); // Close the modal immediately

    try {
      // 1. Delete the blog post from Firestore
      await deleteDoc(doc(db, 'blogs', blogId));
      console.log('Blog post deleted from Firestore:', blogId);

      // 2. Delete the cover image from Firebase Storage if it exists
      if (coverUrl) {
        const imageRef = ref(storage, coverUrl);
        await deleteObject(imageRef);
        console.log('Cover image deleted from Storage:', coverUrl);
      }

      // 3. Update the local state to remove the deleted blog
      setBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== blogId));
      // Optionally, refetch blogs to ensure consistency, especially if pagination is active
      // fetchBlogs(); // This might reset pagination, consider fetching only if necessary
    } catch (error) {
      console.error("Erro ao deletar o artigo ou a imagem da capa:", error);
      alert('Erro ao deletar o artigo. Verifique o console para mais detalhes.');
    } finally {
      setBlogToDelete(null); // Clear the blog to delete state
    }
  };

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
      <div className="flex flex-row justify-between w-full gap-4 mb-4">
        <FluencyInput
          variant="solid"
          placeholder="Buscar artigo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <FluencySelect
          value={filterLanguage}
          onChange={(e: { target: { value: SetStateAction<string> } }) => setFilterLanguage(e.target.value)}
          placeholder="Todos idiomas"
        >
          <option value="">Todos idiomas</option>
          {availableLanguages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </FluencySelect>

        <FluencySelect
          value={filterLevel}
          onChange={(e: { target: { value: SetStateAction<string> } }) => setFilterLevel(e.target.value)}
          placeholder="Todos níveis"
        >
          <option value="">Todos níveis</option>
          {availableLevels.map(lvl => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </FluencySelect>
        {isAdmin && (
          <FluencyButton variant='glass' onClick={() => router.push('blog/new')}>
            Criar
          </FluencyButton>
        )}
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
            <BlogCard
              key={blog.id}
              blog={blog}
              isAdmin={isAdmin} // Pass the isAdmin prop
              onDelete={handleDelete} // Pass the handleDelete function
            />
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja deletar este artigo? Esta ação é irreversível."
        confirmButtonText="Deletar"
        confirmButtonVariant="danger"
      />
    </div>
  )
}