// src/app/teacher/cursos/curso/lição/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase"; // Adjust the import path as needed
import Link from "next/link";
import {
  FiCheckCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiLoader,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import LessonDisplay from "@/app/ui/Components/Course/Component/LessonDisplay";
import {
  Lesson,
  Enrollment,
  Section,
  QuizResult,
} from "@/app/ui/Components/Course/types";
import FluencyButton from "@/app/ui/Components/Button/button";
import QuizComponent from "@/app/ui/Components/Course/Component/QuizComponent";
import SpinningLoader from "@/app/ui/Animations/SpinningComponent";

export default function LessonPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const lessonId = searchParams.get("lessonId");

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [savedQuizData, setSavedQuizData] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (!courseId || !lessonId) {
      toast.error("IDs de curso ou lição inválidos.");
      router.push("/teacher-dashboard/cursos");
      return;
    }

    const fetchData = async () => {
      if (!session?.user?.id) return;
      setNextLessonId(null); // Reset next lesson ID on fetch
      try {
        // 1. Fetch Enrollment Status & Progress
        const enrollmentRef = doc(
          db,
          "users",
          session.user.id,
          "enrollments",
          courseId
        );
        const enrollmentSnap = await getDoc(enrollmentRef);
        if (!enrollmentSnap.exists()) {
          toast.error("Você não está matriculado neste curso.");
          router.push(`/teacher-dashboard/cursos/curso?id=${courseId}`);
          return;
        }
        const currentEnrollment = enrollmentSnap.data() as Enrollment;
        setEnrollment(currentEnrollment);
        setIsCompleted(!!currentEnrollment.progress?.[lessonId]);

        // 2. Fetch Lesson Data and Course Structure for Navigation
        let lessonData: Lesson | null = null;
        let currentSection: Section | null = null;
        let sections: Section[] = [];

        const courseRef = doc(db, "Cursos", courseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
          // Fetch sections ordered by an 'order' field (assuming it exists)
          const sectionsQuery = query(
            collection(db, "Cursos", courseId, "sections"),
            orderBy("order", "asc")
          );
          const sectionsSnap = await getDocs(sectionsQuery);

          for (const sectionDoc of sectionsSnap.docs) {
            const sectionData = {
              id: sectionDoc.id,
              ...sectionDoc.data(),
            } as Section;
            // Fetch lessons for this section, ordered by an 'order' field
            const lessonsQuery = query(
              collection(
                db,
                "Cursos",
                courseId,
                "sections",
                sectionDoc.id,
                "lessons"
              ),
              orderBy("order", "asc")
            );
            const lessonsSnap = await getDocs(lessonsQuery);
            sectionData.lessons = lessonsSnap.docs.map(
              (lessonDoc) =>
                ({ id: lessonDoc.id, ...lessonDoc.data() } as Lesson)
            );
            sections.push(sectionData);

            // Check if the current lesson is in this section
            const foundLesson = sectionData.lessons.find(
              (l) => l.id === lessonId
            );
            if (foundLesson) {
              lessonData = { ...foundLesson, sectionId: sectionDoc.id };
              currentSection = sectionData;
            }
          }
        }

        if (!lessonData || !currentSection) {
          toast.error("Lição não encontrada.");
          router.push(`cursos/curso?id=${courseId}`);
          return;
        }
        setLesson(lessonData);

        // 3. Determine Next Lesson ID
        const currentLessonIndex = currentSection.lessons.findIndex(
          (l) => l.id === lessonId
        );
        const currentSectionIndex = sections.findIndex(
          (s) => s.id === currentSection?.id
        );

        if (currentLessonIndex < currentSection.lessons.length - 1) {
          // Next lesson in the same section
          setNextLessonId(currentSection.lessons[currentLessonIndex + 1].id);
        } else if (currentSectionIndex < sections.length - 1) {
          // First lesson of the next section
          const nextSection = sections[currentSectionIndex + 1];
          if (nextSection && nextSection.lessons.length > 0) {
            setNextLessonId(nextSection.lessons[0].id);
          }
        }
        // If it's the last lesson of the last section, nextLessonId remains null
      } catch (error) {
        console.error("Error fetching lesson data: ", error);
        toast.error("Falha ao carregar a lição.");
        router.push(`/teacher-dashboard/cursos/curso?id=${courseId}`);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session, router, courseId, lessonId]);

  useEffect(() => {
  const fetchSavedQuizData = async () => {
    if (!session?.user?.id || !courseId || !lessonId) return;
    try {
      const quizResultRef = doc(
        db,
        "users",
        session.user.id,
        "quizResults",
        `${courseId}_${lessonId}`
      );
      const quizResultSnap = await getDoc(quizResultRef);
      if (quizResultSnap.exists()) {
        setSavedQuizData(quizResultSnap.data() as QuizResult);
      }
    } catch (error) {
      console.error("Erro ao buscar dados salvos do quiz:", error);
    }
  };

  fetchSavedQuizData();
}, [session?.user?.id, courseId, lessonId]);


  const handleMarkComplete = async () => {
    if (
      !courseId ||
      !lessonId ||
      !session?.user?.id ||
      markingComplete ||
      isCompleted ||
      !enrollment
    )
      return;

    setMarkingComplete(true);
    const toastId = toast.loading("Marcando como concluída...");

    try {
      const enrollmentRef = doc(
        db,
        "users",
        session.user.id,
        "enrollments",
        courseId
      );
      const newProgress = { ...enrollment.progress, [lessonId]: true };

      // 🔍 Reconta TODAS as lições do curso
      let totalLessons = 0;
      const sectionsQuery = query(
        collection(db, "Cursos", courseId, "sections"),
        orderBy("order", "asc")
      );
      const sectionsSnap = await getDocs(sectionsQuery);

      for (const sectionDoc of sectionsSnap.docs) {
        const lessonsQuery = query(
          collection(
            db,
            "Cursos",
            courseId,
            "sections",
            sectionDoc.id,
            "lessons"
          ),
          orderBy("order", "asc")
        );
        const lessonsSnap = await getDocs(lessonsQuery);
        totalLessons += lessonsSnap.docs.length;
      }

      const completedCount = Object.values(newProgress).filter(Boolean).length;
      const courseCompleted = completedCount >= totalLessons;

      await updateDoc(enrollmentRef, {
        progress: newProgress,
        lastAccessed: serverTimestamp(),
        completed: courseCompleted,
      });

      setEnrollment((prev) =>
        prev ? { ...prev, progress: newProgress } : null
      );
      setIsCompleted(true);

      toast.success("Lição marcada como concluída!", { id: toastId });

      if (courseCompleted) {
        toast.success("Parabéns! Você concluiu o curso!");
      }
    } catch (error) {
      console.error("Erro ao marcar como concluída: ", error);
      toast.error("Falha ao marcar lição como concluída.", { id: toastId });
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleNavigateNext = () => {
    if (nextLessonId) {
      router.push(`licao?courseId=${courseId}&lessonId=${nextLessonId}`);
    } else {
      router.push(`/teacher-dashboard/cursos/curso?id=${courseId}`);
    }
  };

  // Function to handle quiz submission and save to Firebase
  const handleQuizSubmission = async (
    quizResults: {
      answers: Record<string, string>;
      score: number;
      totalQuestions: number;
      correct: boolean;
    }
  ) => {
    if (!session?.user?.id || !courseId || !lessonId) return;

    try {
      const quizResultRef = doc(
        db,
        "users",
        session.user.id,
        "quizResults",
        `${courseId}_${lessonId}`
      );

      const quizData = {
        userId: session.user.id,
        courseId,
        lessonId,
        answers: quizResults.answers,
        score: quizResults.score,
        totalQuestions: quizResults.totalQuestions,
        percentage: Math.round((quizResults.score / quizResults.totalQuestions) * 100),
        correct: quizResults.correct,
        submittedAt: serverTimestamp(),
        lessonTitle: lesson?.title || "",
      };

      await setDoc(quizResultRef, quizData, { merge: true });
      
      console.log("Quiz results saved to Firebase:", quizData);
    } catch (error) {
      console.error("Error saving quiz results:", error);
      toast.error("Erro ao salvar resultados do quiz.");
    }
  };

  if (!lesson) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <SpinningLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-4 bg-fluency-bg-light dark:bg-fluency-bg-dark min-h-screen">
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "bg-white dark:bg-fluency-gray-800 text-gray-900 dark:text-white shadow-lg",
        }}
      />

      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg shadow-lg p-6">
        <div className="flex flex-row items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-fluency-text-light dark:text-fluency-text-dark">
            {lesson.title}
          </h1>
          <Link href={`/teacher-dashboard/cursos/curso?id=${courseId}`}>
            <FluencyButton variant="gray">
              <FiArrowLeft className="mr-2 w-5 h-5" />
              Voltar para o Curso
            </FluencyButton>
          </Link>
        </div>

        <LessonDisplay lesson={lesson} />

        {lesson.quiz && lesson.quiz.length > 0 && (
          <QuizComponent 
            quiz={lesson.quiz} 
            onQuizSubmit={handleQuizSubmission}
            savedQuizData={savedQuizData}
          />
        )}

        <div className="mt-8 pt-6 border-t border-fluency-gray-200 dark:border-fluency-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <FluencyButton
            onClick={handleMarkComplete}
            variant={isCompleted ? "warning" : "gray"}
            disabled={isCompleted || markingComplete}
            className="w-full sm:w-auto"
          >
            {markingComplete ? (
              <FiLoader className="animate-spin mr-2 w-5 h-5" />
            ) : isCompleted ? (
              <FiCheckCircle className="mr-2 w-5 h-5" />
            ) : (
              <FiCheck className="mr-2 w-5 h-5" />
            )}
            {isCompleted ? "Concluída" : "Marcar como Concluída"}
          </FluencyButton>

          <FluencyButton
            onClick={handleNavigateNext}
            variant={nextLessonId && isCompleted ? "confirm" : "gray"}
            disabled={!isCompleted}
            className="w-full sm:w-auto"
          >
            {nextLessonId
              ? "Próxima Lição"
              : isCompleted
              ? "Concluir Curso"
              : "Fim do Curso"}
            <FiArrowRight className="ml-2 w-5 h-5" />
          </FluencyButton>
        </div>
      </div>
    </div>
  );
}