"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import Link from "next/link";
import Image from "next/image";
import { FiClock, FiBookOpen, FiArrowRight } from "react-icons/fi";
import { LuFileSpreadsheet } from "react-icons/lu";
import toast, { Toaster } from "react-hot-toast";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencySkeleton from "@/app/ui/Animations/FluencySkeleton";
import { Course } from "@/app/ui/Components/Course/types";

const StudentCoursesPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<
    (Course & {
      sectionCount: number;
      lessonCount: number;
      isEnrolled: boolean;
    })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const coursesCollection = collection(db, "courses");
        const studentRole = session?.user?.role || "student";

        const q = query(coursesCollection, where("role", "==", studentRole));
        const querySnapshot = await getDocs(q);

        const coursesData = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const courseId = docSnapshot.id;
            const courseData = docSnapshot.data();

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

            // Verifica matrícula
            let isEnrolled = false;
            try {
              const enrollmentRef = doc(
                db,
                "users",
                session?.user?.id!,
                "enrollments",
                courseId
              );
              const enrollmentSnap = await getDoc(enrollmentRef);
              isEnrolled = enrollmentSnap.exists();
            } catch (e) {
              console.error("Erro ao buscar matrícula:", e);
            }

            return {
              ...(courseData as Course),
              id: courseId,
              sectionCount,
              lessonCount,
              isEnrolled,
            };
          })
        );

        setCourses(coursesData);
      } catch (error) {
        console.error("Erro ao carregar cursos: ", error);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md overflow-hidden hover:shadow-xl transition-shadow duration-300 min-w-full"
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
                  <h2 className="text-xl font-semibold text-fluency-text-light dark:text-fluency-text-dark">
                    {course.title}
                  </h2>
                  <span className="px-3 text-xs font-semibold py-1 bg-fluency-blue-200 dark:bg-fluency-blue-800 rounded-md">
                    {course.language}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                  <FiClock className="flex-shrink-0" />
                  <span>{course.duration}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                  <FiBookOpen className="flex-shrink-0" />
                  <span>
                    {course.sectionCount}{" "}
                    {course.sectionCount === 1 ? "Seção" : "Seções"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                  <LuFileSpreadsheet className="flex-shrink-0" />
                  <span>
                    {course.lessonCount}{" "}
                    {course.lessonCount === 1 ? "Lição" : "Lições"}
                  </span>
                </div>

                <p className="text-sm text-fluency-text-light dark:text-fluency-text-dark line-clamp-3 mt-2">
                  {course.description}
                </p>

                <Link href={`cursos/curso?id=${course.id}`} className="mt-2">
                  <FluencyButton variant="confirm" className="w-full">
                    <span>
                      {course.isEnrolled ? "Continuar" : "Ver Detalhes"}
                    </span>
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
