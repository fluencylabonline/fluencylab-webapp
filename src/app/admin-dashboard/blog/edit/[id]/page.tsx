'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/app/firebase'
import Link from 'next/link'
import Image from 'next/image'
import MarkdownEditor from '@/app/SharedPages/Blog/components/MarkdownEditor'
import FluencyButton from '@/app/ui/Components/Button/button'
import FluencyInput from '@/app/ui/Components/Input/input'
import FluencySelect from '@/app/ui/Components/Input/select'
import SpinningLoader from '@/app/ui/Animations/SpinningComponent'

type Blog = {
  id: string
  title: string
  content: string
  tags?: string[]
  level: string
  language: string
  coverUrl?: string
}

export default function EditBlogPage() {
  const [id, setId] = useState<string | null>(null)
  const [blog, setBlog] = useState<Blog | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [level, setLevel] = useState('Iniciante')
  const [language, setLanguage] = useState('Português')
  const [coverUrl, setCoverUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlId = params.get("id")
    setId(urlId)
  }, [])

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return
      
      try {
        const docRef = doc(db, 'blogs', id as string)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const blogData = { id: docSnap.id, ...docSnap.data() } as Blog
          setBlog(blogData)
          setTitle(blogData.title)
          setContent(blogData.content)
          setTags(blogData.tags?.join(', ') || '')
          setLevel(blogData.level)
          setLanguage(blogData.language)
          setCoverUrl(blogData.coverUrl || '')
          setImagePreview(blogData.coverUrl || null)
        } else {
          console.log('Post não encontrado!')
        }
      } catch (error) {
        console.error('Erro ao buscar post:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBlog()
  }, [id])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !content) {
      alert('Por favor, preencha o título e o conteúdo do post.')
      return
    }
    
    setSaving(true)
    
    try {
      let finalCoverUrl = coverUrl

      if (imageFile) {
        const storageRef = ref(storage, `blog-covers/${Date.now()}-${imageFile.name}`)
        const uploadTask = uploadBytesResumable(storageRef, imageFile)

        finalCoverUrl = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
            (error) => {
              console.error('Upload falhou:', error)
              reject(error)
            },
            () => getDownloadURL(uploadTask.snapshot.ref).then(resolve)
          )
        })
      }

      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      
      const updatedData = {
        title,
        content,
        tags: tagsArray,
        level,
        language,
        coverUrl: finalCoverUrl,
      }

      await updateDoc(doc(db, 'blogs', id as string), updatedData)
      router.push(`/admin-dashboard/blog?id=${id}`)
      
    } catch (error) {
      console.error('Erro ao atualizar o post:', error)
      alert('Ocorreu um erro ao atualizar o post. Por favor, tente novamente.')
    } finally {
      setSaving(false)
      setUploadProgress(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
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
            O post que você está tentando editar não foi encontrado.
          </p>
          <Link href="/admin-dashboard/blog" passHref>
            <FluencyButton variant="confirm" className="w-full">
              Voltar para o painel
            </FluencyButton>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-4">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <Link href={`/admin-dashboard/blog?id=${id}`} passHref>
            <FluencyButton variant="danger" className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Voltar para o post
            </FluencyButton>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Editar Post</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título
              </label>
              <FluencyInput
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                variant="solid"
                placeholder="Digite o título do post"
              />
            </div>

            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Imagem de Capa
              </label>
              <div className="flex flex-col sm:flex-row gap-6">
                {imagePreview && (
                  <div className="relative aspect-video w-full sm:w-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Image 
                      src={imagePreview} 
                      alt="Preview" 
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <input
                    type="file"
                    id="coverImage"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Selecione uma nova imagem para substituir a atual
                  </p>
                  
                  {uploadProgress !== null && (
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (separadas por vírgula)
                </label>
                <FluencyInput
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  variant="solid"
                  placeholder="javascript, react, tutorial"
                />
              </div>
              
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nível
                </label>
                <FluencySelect
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </FluencySelect>
              </div>
              
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Idioma
                </label>
                <FluencySelect
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="Português">Português</option>
                  <option value="English">English</option>
                  <option value="Español">Español</option>
                </FluencySelect>
              </div>
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conteúdo (Markdown)
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <MarkdownEditor content={content} setContent={setContent} />
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Link href={`/admin-dashboard/blog?id=${id}`} passHref>
                <FluencyButton variant="danger" className="w-full sm:w-auto">
                  Cancelar
                </FluencyButton>
              </Link>
              
              <FluencyButton 
                type="submit" 
                disabled={saving}
                variant="confirm"
                className="w-full sm:w-auto"
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {uploadProgress ? `Enviando (${Math.round(uploadProgress)}%)` : 'Salvando...'}
                  </div>
                ) : 'Atualizar Post'}
              </FluencyButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}