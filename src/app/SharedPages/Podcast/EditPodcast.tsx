'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/app/firebase'

export default function EditPodcastForm({ id, initialData }: { id: string; initialData: any }) {


  const [loading, setLoading] = useState(true)
  const [podcast, setPodcast] = useState<{
      title: string;
      description: string;
      language: string;
      level: string;
      labels: string[];
      transcription: string;
      mediaUrl: string;
      coverUrl: string;
    }>({
      title: '',
      description: '',
      language: '',
      level: '',
      labels: [],
      transcription: '',
      mediaUrl: '',
      coverUrl: '',
    })

  useEffect(() => {
    if (id) {
      const fetchPodcast = async () => {
        const docRef = doc(db, 'podcasts', id as string)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setPodcast(docSnap.data() as any)
        }
        setLoading(false)
      }
      fetchPodcast()
    }
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPodcast((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const docRef = doc(db, 'podcasts', id as string)
    await updateDoc(docRef, podcast)
    alert('Podcast updated successfully!')
  }

  if (loading) return <p>Loading...</p>

  return (
    <form onSubmit={handleUpdate} className="space-y-4 max-w-xl mx-auto p-4">
      <input
        type="text"
        name="title"
        value={podcast.title}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Title"
        required
      />
      <textarea
        name="description"
        value={podcast.description}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Description"
        required
      />
      <input
        type="text"
        name="language"
        value={podcast.language}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Language"
        required
      />
      <input
        type="text"
        name="level"
        value={podcast.level}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Level"
        required
      />
      <input
        type="text"
        name="labels"
        value={podcast.labels.join(', ')}
        onChange={(e) =>
          setPodcast((prev) => ({ ...prev, labels: e.target.value.split(',').map((l) => l.trim()) }))
        }
        className="w-full p-2 border rounded"
        placeholder="Labels (comma separated)"
      />
      <textarea
        name="transcription"
        value={podcast.transcription}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Transcription"
      />
      <input
        type="text"
        name="mediaUrl"
        value={podcast.mediaUrl}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Media URL"
      />
      <input
        type="text"
        name="coverUrl"
        value={podcast.coverUrl}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Cover URL"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Update Podcast
      </button>
    </form>
  )
}
