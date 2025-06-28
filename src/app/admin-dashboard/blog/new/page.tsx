'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/app/firebase'
import MarkdownEditor from '@/app/SharedPages/Blog/components/MarkdownEditor'
import Link from 'next/link'
import Image from 'next/image'
import FluencyButton from '@/app/ui/Components/Button/button' // Added custom button
import FluencyInput from '@/app/ui/Components/Input/input' // Added custom input
import FluencySelect from '@/app/ui/Components/Input/select' // Added custom select

export default function NewBlogPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [level, setLevel] = useState('Iniciante')
  const [language, setLanguage] = useState('Português')
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

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
    
    setLoading(true)
    
    try {
      let coverUrl = ''

      if (imageFile) {
        const storageRef = ref(storage, `blog-covers/${Date.now()}-${imageFile.name}`)
        const uploadTask = uploadBytesResumable(storageRef, imageFile)

        coverUrl = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              setUploadProgress(progress)
            },
            (error) => {
              console.error('Upload falhou:', error)
              reject(error)
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                resolve(downloadURL)
              })
            }
          )
        })
      }

      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      
      const docRef = await addDoc(collection(db, 'blogs'), {
        title,
        content,
        tags: tagsArray,
        level,
        language,
        createdAt: serverTimestamp(),
        coverUrl,
      })
      
      router.push(`/admin-dashboard/blog?id=${docRef.id}`)
    } catch (error) {
      console.error('Erro ao salvar o post:', error)
      alert('Ocorreu um erro ao salvar o post. Por favor, tente novamente.')
    } finally {
      setLoading(false)
      setUploadProgress(null)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Section */}
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

          {/* Image Upload Section */}
          <div>
            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Imagem de Capa
            </label>
            <input
              type="file"
              id="coverImage"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
            />
            
            {uploadProgress !== null && (
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pré-visualização:
                </p>
                <div className="relative aspect-video max-w-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tags Input */}
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
            
            {/* Level Select */}
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
            
            {/* Language Select */}
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
          
          {/* Markdown Editor */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Conteúdo (Markdown)
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <MarkdownEditor content={content} setContent={setContent} />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <Link href="/admin-dashboard/blog" passHref>
              <FluencyButton variant="danger" className="w-full sm:w-auto">
                Cancelar
              </FluencyButton>
            </Link>
            
            <FluencyButton 
              type="submit" 
              disabled={loading}
              variant="confirm"
              className="w-full sm:w-auto"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {uploadProgress ? `Enviando (${Math.round(uploadProgress)}%)` : 'Salvando...'}
                </div>
              ) : 'Publicar Post'}
            </FluencyButton>
          </div>
        </form>
      </div>
    </div>
  )
}