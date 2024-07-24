'use client';
import { useEffect, useState } from "react";
import { DocumentData, QuerySnapshot, collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";
import Link from "next/link";
import { Accordion, AccordionItem } from "@nextui-org/react";
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
    <div className="flex flex-col items-start gap-1">
      <Accordion>
        {slides.map((slide, index) => (
          <AccordionItem key={index} aria-label={slide.title} title={slide.title}>
            <div className="flex flex-col items-center justify-center text-center w-32 h-44 rounded-md bg-fluency-bg-light dark:bg-fluency-bg-dark p-2">
              <Link className="flex flex-row items-center gap-2" key={slide.link} href={{ pathname: `apostilas/slides/${encodeURIComponent(slide.title)}`, query: { slide: slide.link } }} passHref>
                <p className="font-bold text-md text-fluency-orange-500 hover:text-fluency-orange-600 duration-300 ease-in-out cursor-pointer">{slide.title}</p>
                <button 
                  onClick={() => copyLinkToClipboard(slide.link)} 
                  className="p-1 text-orange-500 hover:text-orange-600"
                  >
                  <FaRegCopy />
                </button>
              </Link>
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
