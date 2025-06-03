import Link from 'next/link'
import Image from 'next/image'

type BlogCardProps = {
  blog: {
    id: string
    title: string
    content: string
    coverUrl?: string
    createdAt?: { seconds: number }
  }
}

export default function BlogCard({ blog }: BlogCardProps) {
  const shortText = blog.content.slice(0, 120) + '...'

  return (
    <Link href={`/blog/${blog.id}`}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {blog.coverUrl && (
          <Image
            src={blog.coverUrl}
            alt={blog.title}
            width={400}
            height={200}
            className="object-cover w-full h-48"
          />
        )}
        <div className="p-4">
          <h3 className="text-lg font-semibold">{blog.title}</h3>
          <p className="text-sm text-gray-600 mt-2">{shortText}</p>
        </div>
      </div>
    </Link>
  )
}
