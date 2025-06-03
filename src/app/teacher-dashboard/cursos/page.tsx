"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where, or } from "firebase/firestore";
import { db } from "@/app/firebase";
import Link from "next/link";
import Image from "next/image";
import { FiClock, FiBookOpen, FiArrowRight } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencySkeleton from "@/app/ui/Animations/FluencySkeleton";
import { Course } from "@/app/ui/Components/Course/types";
import { LuFileSpreadsheet } from "react-icons/lu";

const StudentCoursesPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const coursesCollection = collection(db, "courses");
        const teacherRole = session?.user?.role || "teacher";

        const q = query(
          coursesCollection,
          where("role", "==", teacherRole)
        );

        const querySnapshot = await getDocs(q);
        const coursesData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const courseId = doc.id;
            const courseData = doc.data();

            const sectionsRef = collection(db, "courses", courseId, "sections");
            const sectionsSnapshot = await getDocs(sectionsRef);
            const sectionDocs = sectionsSnapshot.docs;

            const sectionCount = sectionDocs.length;
            let lessonCount = 0;

            for (const sectionDoc of sectionDocs) {
              const lessonsSnapshot = await getDocs(
                collection(
                  db,
                  "courses",
                  courseId,
                  "sections",
                  sectionDoc.id,
                  "lessons"
                )
              );
              lessonCount += lessonsSnapshot.size;
            }

            return {
              id: courseId,
              ...courseData,
              sectionCount,
              lessonCount,
            } as Course & { sectionCount: number; lessonCount: number };
          })
        );

        setCourses(coursesData);
      } catch (error) {
        console.error(
          "Error fetching courses and their sections/lessons: ",
          error
        );
        toast.error("Falha ao carregar os cursos e conteúdos.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [session, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <FluencySkeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "bg-white dark:bg-fluency-gray-800 text-gray-900 dark:text-white shadow-lg",
        }}
      />

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg">
          <p className="text-xl text-fluency-text-light dark:text-fluency-text-dark mb-2">
            Nenhum curso disponível
          </p>
          <p className="text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
            Novos cursos serão adicionados em breve
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative w-full h-48">
                <Image
                  src={course.imageUrl || "/images/course-placeholder.jpg"}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 38vw"
                  onError={(e) => {
                    e.currentTarget.src = "/images/course-placeholder.jpg";
                  }}
                />
              </div>

              <div className="p-4 flex flex-col gap-3">
                <div className="flex flex-row items-start justify-between gap-2 text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                  <h2 className="text-xl font-semibold text-fluency-text-light dark:text-fluency-text-dark truncate">
                    {course.title}
                  </h2>
                  <span className="px-3 font-semibold py-1 bg-fluency-blue-200 dark:bg-fluency-blue-800 rounded-md">
                    {course.language}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                  <FiClock className="flex-shrink-0" />
                  <span>{course.duration}</span>
                </div>

                {course.lessons && (
                  <div className="flex items-center gap-2 text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                    <FiBookOpen className="flex-shrink-0" />
                    <span>
                      {course.sectionCount}{" "}
                      {course.sectionCount === 1 ? "Seção" : "Seções"}
                    </span>
                  </div>
                )}

                {course.lessons && (
                  <div className="flex items-center gap-2 text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                    <LuFileSpreadsheet  className="flex-shrink-0" />
                    <span>
                      {course.lessonCount}{" "}
                      {course.lessonCount === 1 ? "Lição" : "Lições"}
                    </span>
                  </div>
                )}

                <p className="text-sm text-fluency-text-light dark:text-fluency-text-dark line-clamp-3 mt-2">
                  {course.description}
                </p>

                <Link href={`cursos/curso?id=${course.id}`} className="mt-2">
                  <FluencyButton variant="confirm" className="w-full">
                    <span>Ver Detalhes</span>
                    <FiArrowRight className="ml-2 w-4 h-4" />
                  </FluencyButton>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCoursesPage;
