'use client'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/app/firebase'
import EditPodcastForm from '@/app/SharedPages/Podcast/EditPodcast'

export default async function EditPodcastPage({ params }: { params: { id: string } }) {
  const id = params.id

  const docRef = doc(db, 'podcasts', id)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return <div>Podcast not found</div>
  }

  const podcast = docSnap.data()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Podcast</h1>
      <EditPodcastForm id={id} initialData={podcast} />
    </div>
  )
}
