'use client'
import React, { useState, useRef, useCallback } from 'react'
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/app/firebase'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// Rich Text Editor Component
const RichTextEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize content only once
  React.useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || ''
      setIsInitialized(true)
    }
  }, [value, isInitialized])

  const handleCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle Tab key
    if (e.key === 'Tab') {
      e.preventDefault()
      handleCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;')
    }
    // Handle Ctrl+B for bold
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault()
      handleCommand('bold')
    }
    // Handle Ctrl+I for italic
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault()
      handleCommand('italic')
    }
    // Handle Ctrl+U for underline
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault()
      handleCommand('underline')
    }
  }, [handleCommand])

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleCommand('bold')}
          className="px-3 py-1 border rounded hover:bg-gray-200 font-bold"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => handleCommand('italic')}
          className="px-3 py-1 border rounded hover:bg-gray-200 italic"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => handleCommand('underline')}
          className="px-3 py-1 border rounded hover:bg-gray-200 underline"
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => handleCommand('justifyLeft')}
          className="px-3 py-1 border rounded hover:bg-gray-200"
          title="Align Left"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => handleCommand('justifyCenter')}
          className="px-3 py-1 border rounded hover:bg-gray-200"
          title="Align Center"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => handleCommand('justifyRight')}
          className="px-3 py-1 border rounded hover:bg-gray-200"
          title="Align Right"
        >
          →
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => handleCommand('insertUnorderedList')}
          className="px-3 py-1 border rounded hover:bg-gray-200"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => handleCommand('insertOrderedList')}
          className="px-3 py-1 border rounded hover:bg-gray-200"
          title="Numbered List"
        >
          1. List
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => handleCommand('indent')}
          className="px-3 py-1 border rounded hover:bg-gray-200"
          title="Indent"
        >
          →|
        </button>
        <button
          type="button"
          onClick={() => handleCommand('outdent')}
          className="px-3 py-1 border rounded hover:bg-gray-200"
          title="Outdent"
        >
          |←
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => handleCommand('removeFormat')}
          className="px-3 py-1 border rounded hover:bg-gray-200"
          title="Clear Formatting"
        >
          Clear
        </button>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="min-h-40 p-3 outline-none"
        style={{ whiteSpace: 'pre-wrap' }}
        data-placeholder="Enter your transcription here..."
      />
      
      {/* Instructions */}
      <div className="bg-gray-50 border-t p-2 text-sm text-gray-600">
        <p>
          <strong>Keyboard shortcuts:</strong> Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline), Tab (Indent)
        </p>
      </div>
    </div>
  )
}

const CreatePodcastForm = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [transcription, setTranscription] = useState('')
  const [language, setLanguage] = useState('')
  const [level, setLevel] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [cover, setCover] = useState<File | null>(null)
  const [media, setMedia] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const [existingLanguages, setExistingLanguages] = useState<string[]>(['English', 'Spanish', 'French'])
  const [existingLevels, setExistingLevels] = useState<string[]>(['Beginner', 'Intermediate', 'Advanced'])
  const [existingLabels, setExistingLabels] = useState<string[]>(['Business', 'Culture', 'Travel'])

  const { data: session } = useSession()
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCover(e.target.files[0])
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !language || !level || !media) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)

    try {
      const mediaType = media.type.startsWith('video') ? 'video' : 'audio'

      const docRef = await addDoc(collection(db, 'podcasts'), {
        title,
        description,
        language,
        level,
        labels,
        transcription,
        createdAt: serverTimestamp(),
        createdBy: session?.user?.email || 'unknown',
        mediaUrl: '', // temporary
        mediaType,
        coverUrl: '',
      })

      const mediaRef = ref(storage, `podcasts/${docRef.id}/media`)
      await uploadBytes(mediaRef, media)
      const mediaUrl = await getDownloadURL(mediaRef)

      let coverUrl = ''
      if (cover) {
        const coverRef = ref(storage, `podcasts/${docRef.id}/cover`)
        await uploadBytes(coverRef, cover)
        coverUrl = await getDownloadURL(coverRef)
      }

      await updateDoc(doc(db, 'podcasts', docRef.id), {
        mediaUrl,
        coverUrl,
      })

      router.push('/admin/podcasts')
    } catch (error) {
      console.error('Error creating podcast:', error)
      alert('Error creating podcast.')
    } finally {
      setLoading(false)
    }
  }

  const filterOptions = (query: string, options: string[]) => {
    return options.filter((option) => option.toLowerCase().includes(query.toLowerCase()))
  }

  return (
    <form onSubmit={handleCreate} className="space-y-4">
      <input
        type="text"
        placeholder="Title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <textarea
        placeholder="Description *"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <label className="block text-sm font-medium">Language</label>
      <input
        type="text"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        placeholder="Type or select a language"
        className="block w-full px-4 py-2 border rounded-md"
      />
      <div className="mt-2">
        {filterOptions(language, existingLanguages).map((lang) => (
          <div
            key={lang}
            className="cursor-pointer hover:bg-gray-200 px-2 py-1"
            onClick={() => setLanguage(lang)}
          >
            {lang}
          </div>
        ))}
        {language && !existingLanguages.includes(language) && (
          <button
            type="button"
            onClick={() => setExistingLanguages([...existingLanguages, language])}
            className="text-sm text-blue-600 hover:underline mt-2"
          >
            Create {language}
          </button>
        )}
      </div>

      <label className="block text-sm font-medium">Level</label>
      <input
        type="text"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        placeholder="Type or select a level"
        className="block w-full px-4 py-2 border rounded-md"
      />
      <div className="mt-2">
        {filterOptions(level, existingLevels).map((lvl) => (
          <div
            key={lvl}
            className="cursor-pointer hover:bg-gray-200 px-2 py-1"
            onClick={() => setLevel(lvl)}
          >
            {lvl}
          </div>
        ))}
        {level && !existingLevels.includes(level) && (
          <button
            type="button"
            onClick={() => setExistingLevels([...existingLevels, level])}
            className="text-sm text-blue-600 hover:underline mt-2"
          >
            Create {level}
          </button>
        )}
      </div>

      <label className="block text-sm font-medium">Labels (Optional)</label>
      <input
        type="text"
        value={labels.join(', ')}
        onChange={(e) => setLabels(e.target.value.split(',').map((label) => label.trim()))}
        placeholder="Type labels separated by commas"
        className="block w-full px-4 py-2 border rounded-md"
      />
      <div className="mt-2">
        {filterOptions(labels.join(', '), existingLabels).map((label) => (
          <div
            key={label}
            className="cursor-pointer hover:bg-gray-200 px-2 py-1"
            onClick={() => setLabels([...labels, label])}
          >
            {label}
          </div>
        ))}
        {labels.length > 0 && !existingLabels.includes(labels[0]) && (
          <button
            type="button"
            onClick={() => setExistingLabels([...existingLabels, ...labels])}
            className="text-sm text-blue-600 hover:underline mt-2"
          >
            Create labels
          </button>
        )}
      </div>

      <label className="block text-sm font-medium">Cover Image (Optional)</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file:border file:rounded file:px-2 file:py-1"
      />

      <div>
        <label className="block text-sm font-medium mb-2">Transcription</label>
        <RichTextEditor
          value={transcription}
          onChange={setTranscription}
        />
      </div>

      <input
        type="file"
        accept="audio/*,video/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setMedia(e.target.files[0])
          }
        }}
        className="w-full"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Podcast'}
      </button>
    </form>
  )
}

export default CreatePodcastForm