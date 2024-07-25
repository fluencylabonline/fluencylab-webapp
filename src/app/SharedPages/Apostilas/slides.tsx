'use client';
import { useEffect, useState } from "react";
import { DocumentData, QuerySnapshot, collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";
import Link from "next/link";
import { FaRegCopy } from "react-icons/fa6";
import toast from "react-hot-toast";

interface SlideDoc {
  id: string;
  title: string;
  link: string;
}

export default function Kids() {
  const [slides, setSlides] = useState<SlideDoc[]>([]);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const slidesRef = collection(db, 'Slides');
        const slidesSnapshot: QuerySnapshot<DocumentData> = await getDocs(slidesRef);
        const fetchedSlides: SlideDoc[] = slidesSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          link: doc.data().link,
        }));

        setSlides(fetchedSlides);
      } catch (error) {
        console.error('Error fetching slides: ', error);
      }
    };

    fetchSlides();
  }, []);

  const copyLinkToClipboard = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      toast.success('Link copiado!');
    }).catch((error) => {
      console.error('Failed to copy link: ', error);
    });
  };

  return (
    <div className="flex flex-wrap items-start gap-4">
      {slides.map((slide, index) => (
        <div key={index} className="flex flex-col items-center justify-center text-center w-44 h-32 bg-fluency-bg-light dark:bg-fluency-bg-dark p-2">
          <Link className="flex flex-col items-center gap-2" key={slide.link} href={{ pathname: `apostilas/slides/${encodeURIComponent(slide.title)}`, query: { slide: slide.link } }} passHref>
            <p className="font-bold text-sm text-fluency-orange-500 hover:text-fluency-orange-600 duration-300 ease-in-out cursor-pointer">{slide.title}</p>
            <button 
              onClick={() => copyLinkToClipboard(slide.link)} 
              className="text-orange-500 hover:text-orange-600"
            >
              <FaRegCopy />
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
}
