import Link from "next/link";
import Image from "next/image";
import { Delete, Trash } from "lucide-react";

type BlogCardProps = {
  blog: {
    id: string;
    title: string;
    content: string;
    coverUrl?: string;
    createdAt?: { seconds: number };
  };
  // New prop to indicate if the user is an admin
  isAdmin: boolean;
  // New prop for the delete function
  onDelete: (blogId: string, coverUrl?: string) => Promise<void>;
};

export default function BlogCard({ blog, isAdmin, onDelete }: BlogCardProps) {
  const shortText = blog.content.slice(0, 120) + "...";

  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-md shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link
        href={{
          pathname: `blog/${encodeURIComponent(blog.title)}`,
          query: { id: blog.id },
        }}
        passHref
      >
        <div>
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

      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent navigating to the blog post
            onDelete(blog.id, blog.coverUrl);
          }}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-md p-2 hover:bg-red-600 transition-colors"
          aria-label="Delete blog post"
        >
          <Trash className="w-6 h-auto"/>
        </button>
      )}
    </div>
  );
}