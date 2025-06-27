// src/app/teacher/cursos/curso/page.tsx
"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/firebase"; // Adjust the import path as needed
import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiBookOpen, FiChevronRight, FiCheckCircle, FiCircle, FiLock, FiArrowLeft, FiLoader } from "react-icons/fi";
import toast, { Toaster } from 'react-hot-toast'
import { Course, Section, Lesson, Enrollment } from "@/app/ui/Components/Course/types";
import FluencyButton from "@/app/ui/Components/Button/button";
import SpinningLoader from "@/app/ui/Animations/SpinningComponent";

export default function CourseDetailPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (!courseId) {
      toast.error("ID do curso inválido.");
      router.push("/teacher-dashboard/cursos");
      return;
    }

    const fetchData = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      try {
        // 1. Fetch Course Details
        const courseRef = doc(db, "Cursos", courseId);
        const courseSnap = await getDoc(courseRef);

        if (!courseSnap.exists()) {
          toast.error("Curso não encontrado.");
          router.push("/teacher-dashboard/cursos");
          return;
        }
        const courseData = { id: courseSnap.id, ...courseSnap.data() } as Course;

        // Basic access check
        const studentRole = session.user.role || 'teacher';
        if (courseData.role !== 'all' && courseData.role !== studentRole) {
              toast.error("Você não tem permissão para acessar este curso.");
              router.push("/teacher-dashboard/cursos");
              return;
        }

        // Fetch Sections/Lessons and calculate total lessons
        const sectionsCol = collection(db, "Cursos", courseId, "sections");
        const sectionsSnap = await getDocs(sectionsCol);
        let totalLessonsCount = 0;
        const sectionsData = await Promise.all(sectionsSnap.docs.map(async (sectionDoc) => {
            const section = { id: sectionDoc.id, ...sectionDoc.data() } as Section;
            const lessonsCol = collection(db, "Cursos", courseId, "sections", sectionDoc.id, "lessons");
            const lessonsSnap = await getDocs(lessonsCol);
            section.lessons = lessonsSnap.docs.map(lessonDoc => ({ id: lessonDoc.id, ...lessonDoc.data() } as Lesson));
            totalLessonsCount += section.lessons.length;
            return section;
        }));

        courseData.sections = sectionsData;
        courseData.totalLessons = totalLessonsCount;
        setCourse(courseData);

        // 2. Fetch Enrollment Status & Progress
        const enrollmentRef = doc(db, "users", session.user.id, "enrollments", courseId);
        const enrollmentSnap = await getDoc(enrollmentRef);
        if (enrollmentSnap.exists()) {
          const currentEnrollment = enrollmentSnap.data() as Enrollment;
          setEnrollment(currentEnrollment);
          setIsEnrolled(true);
          // Calculate progress
          const completedLessons = Object.values(currentEnrollment.progress || {}).filter(Boolean).length;
          setProgressPercentage(totalLessonsCount > 0 ? Math.round((completedLessons / totalLessonsCount) * 100) : 0);
        } else {
          setIsEnrolled(false);
          setEnrollment(null);
          setProgressPercentage(0);
        }

      } catch (error) {
        console.error("Error fetching course details: ", error);
        toast.error("Falha ao carregar detalhes do curso.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.id) {
        fetchData();
    }

  }, [session, status, router, courseId]);

  const handleEnroll = async () => {
    if (!courseId || !session?.user?.id || enrolling || isEnrolled) return;
    setEnrolling(true);
    const toastId = toast.loading("Realizando matrícula...");
    try {
      const enrollmentRef = doc(db, "users", session.user.id, "enrollments", courseId);
      const newEnrollmentData: Enrollment = {
        courseId: courseId,
        userId: session.user.id,
        enrolledAt: serverTimestamp(),
        progress: {},
        completed: false,
        lastAccessed: serverTimestamp()
      };
      await setDoc(enrollmentRef, newEnrollmentData);
      setEnrollment(newEnrollmentData); // Update local state immediately
      setIsEnrolled(true);
      setProgressPercentage(0);
      toast.success("Matrícula realizada com sucesso!", { id: toastId });
    } catch (error) {
      console.error("Error enrolling: ", error);
      toast.error("Falha ao realizar matrícula.", { id: toastId });
    } finally {
      setEnrolling(false);
    }
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    return !!enrollment?.progress?.[lessonId];
  };

  // Function to find the previous lesson ID for locking logic
  const getPreviousLessonId = (currentSectionIndex: number, currentLessonIndex: number): string | null => {
      if (!course?.sections) return null;

      if (currentLessonIndex > 0) {
          // Previous lesson in the same section
          return course.sections[currentSectionIndex]?.lessons[currentLessonIndex - 1]?.id || null;
      } else if (currentSectionIndex > 0) {
          // Last lesson of the previous section
          const prevSection = course.sections[currentSectionIndex - 1];
          return prevSection?.lessons[prevSection.lessons.length - 1]?.id || null;
      }
      return null; // First lesson of the first section
  };

  if (loading || status === "loading") {
    return <div className="flex justify-center items-center min-h-[92vh]"><SpinningLoader /></div>;
  }

  if (!course) {
    return <div className="flex justify-center items-center min-h-[92vh]"><p>Curso não encontrado.</p></div>;
  }

return (
    <div className="flex flex-col w-full pr-3 pt-2 bg-fluency-bg-light dark:bg-fluency-bg-dark min-h-screen">
      <Toaster position="top-center" toastOptions={{
        className: 'bg-white dark:bg-fluency-gray-800 text-gray-900 dark:text-white shadow-lg',
      }} />

      {/* Course Header Section */}
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg shadow-lg mb-4">
        <div className="grid md:grid-cols-[300px_1fr] gap-6 p-6">
          <div className="relative h-60 w-full rounded-md overflow-hidden">
            <Image
              src={course.imageUrl || '/images/course-placeholder.jpg'}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                e.currentTarget.src = '/images/course-placeholder.jpg';
              }}
            />
          </div>
          
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-fluency-text-light dark:text-fluency-text-dark mb-4">
                {course.title}
              </h1>
              <p className="text-fluency-text-light dark:text-fluency-text-dark mb-6">
                {course.description}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                  <FiClock className="w-5 h-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                  <FiBookOpen className="w-5 h-5" />
                  <span>{course.language}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                  <FiBookOpen className="w-5 h-5" />
                  <span>{course.totalLessons || 0} lições</span>
                </div>
              </div>
            </div>

            {/* Enrollment Section */}
            <div className="space-y-4">
              {isEnrolled ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-fluency-text-light dark:text-fluency-text-dark">
                    <span>Progresso do Curso</span>
                    <span>{progressPercentage}% Completo</span>
                  </div>
                  <div className="w-full bg-fluency-gray-100 dark:bg-fluency-gray-800 rounded-full h-3">
                    <div 
                      className="bg-fluency-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  {/* ✅ Mostrar label de conclusão se progresso for 100% */}
                  {progressPercentage === 100 && (
                    <div className="mt-2 text-green-600 dark:text-green-400 font-semibold flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4" />
                      Curso concluído
                    </div>
                  )}
                </div>
              ) : (
                <FluencyButton
                  onClick={handleEnroll}
                  variant="confirm"
                  disabled={enrolling}
                  className="w-full md:w-auto"
                >
                  {enrolling ? (
                    <FiLoader className="animate-spin mr-2 w-5 h-5" />
                  ) : (
                    <FiBookOpen className="mr-2 w-5 h-5" />
                  )}
                  Matricular-se agora
                </FluencyButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-fluency-text-light dark:text-fluency-text-dark mb-6">
          Conteúdo do Curso
        </h2>
        
        {course.sections && course.sections.length > 0 ? (
          <div className="space-y-4">
            {course.sections.map((section, sectionIndex) => (
              <div key={section.id} className="border border-fluency-gray-200 dark:border-fluency-gray-700 rounded-xl overflow-hidden">
                <h3 className="bg-fluency-gray-200 dark:bg-fluency-gray-800 px-4 py-3 font-semibold text-fluency-text-light dark:text-fluency-text-dark">
                  {section.title}
                </h3>
                
                <div className="divide-y divide-fluency-gray-200 dark:divide-fluency-gray-800">
                  {section.lessons?.map((lesson, lessonIndex) => {
                    const completed = isEnrolled && isLessonCompleted(lesson.id);
                    const prevLessonId = getPreviousLessonId(sectionIndex, lessonIndex);
                    const isLocked = !isEnrolled || (prevLessonId && !isLessonCompleted(prevLessonId));

                    return (
                      <div 
                        key={lesson.id}
                        className={`p-4 flex items-center justify-between ${
                          isLocked ? 'bg-fluency-gray-50 dark:bg-fluency-gray-800 opacity-75' : 'bg-fluency-gray-100 dark:bg-fluency-gray-700 hover:bg-fluency-gray-50 dark:hover:bg-fluency-gray-800'
                        } transition-colors`}
                      >
                        <div className="flex items-center gap-3">
                          {completed ? (
                            <FiCheckCircle className="text-fluency-green-500 w-5 h-5 flex-shrink-0" />
                          ) : (
                            <FiCircle className={`w-5 h-5 flex-shrink-0 ${
                              isLocked ? 'text-fluency-gray-300 dark:text-fluency-gray-600' : 'text-fluency-gray-400 dark:text-fluency-gray-500'
                            }`} />
                          )}
                          <span className={`text-sm ${
                            isLocked ? 'text-fluency-gray-400 dark:text-fluency-gray-500' : 'text-fluency-text-light dark:text-fluency-text-dark'
                          }`}>
                            {lesson.title}
                          </span>
                        </div>
                        
                        {isLocked ? (
                          <FiLock className="text-fluency-gray-400 dark:text-fluency-gray-500 w-5 h-5 flex-shrink-0" />
                        ) : (
                          <Link 
                            href={`curso/licao?courseId=${courseId}&lessonId=${lesson.id}`}
                            className="text-fluency-blue-500 hover:text-fluency-blue-600 transition-colors"
                          >
                            <FiChevronRight className="w-6 h-6" />
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 rounded-xl bg-fluency-gray-100 dark:bg-fluency-gray-800">
            <p className="text-fluency-text-light dark:text-fluency-text-dark">
              Conteúdo em desenvolvimento
            </p>
            <p className="text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
              Novas lições serão adicionadas em breve
            </p>
          </div>
        )}
      </div>
    </div>
  );
}