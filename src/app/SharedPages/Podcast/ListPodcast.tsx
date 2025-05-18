// pages/admin/podcasts/index.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getStorage, ref, deleteObject } from 'firebase/storage'
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '@/app/firebase'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'

type Podcast = {
  id: string
  title: string
  language: string
  level: string
  mediaType: 'audio' | 'video'
  createdAt?: { seconds: number }
}

export default function PodcastList() {
  const { data: session } = useSession()
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPodcasts = async () => {
    setLoading(true)
    const snapshot = await getDocs(collection(db, 'podcasts'))
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Podcast[]
    setPodcasts(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this podcast?')) return

    try {
      const docRef = doc(db, 'podcasts', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const { mediaUrl, coverUrl } = docSnap.data()
        const storage = getStorage()

        // Delete media file
        if (mediaUrl) {
          const mediaRef = ref(storage, mediaUrl)
          await deleteObject(mediaRef).catch(() =>
            console.warn('Failed to delete media:', mediaUrl)
          )
        }

        // Delete cover image
        if (coverUrl) {
          const coverRef = ref(storage, coverUrl)
          await deleteObject(coverRef).catch(() =>
            console.warn('Failed to delete cover:', coverUrl)
          )
        }
      }

      // Delete Firestore doc
      await deleteDoc(docRef)

      // Remove from local state
      setPodcasts((prev) => prev.filter((p) => p.id !== id))

      alert('Podcast deleted successfully.')
    } catch (err) {
      console.error('Error deleting podcast:', err)
      alert('Failed to delete podcast.')
    }
  }

  useEffect(() => {
    fetchPodcasts()
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Podcasts</h1>
        <Link href="podcast/create">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Add Podcast
          </button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : podcasts.length === 0 ? (
        <p>No podcasts found.</p>
      ) : (
        <div className="space-y-4">
          {podcasts.map((podcast) => (
            <div
              key={podcast.id}
              className="p-4 border rounded flex justify-between items-start"
            >
              <div>
                <h2 className="font-semibold text-lg">{podcast.title}</h2>
                <p className="text-sm text-gray-600">
                  {podcast.language} • {podcast.level} • {podcast.mediaType}
                </p>
                {podcast.createdAt && (
                  <p className="text-xs text-gray-400">
                    Created: {format(podcast.createdAt.seconds * 1000, 'PPP')}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Link href={`/admin-dashboard/podcast/edit/${podcast.id}`}>
                  <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                    Edit
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(podcast.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
