// src/app/admin/cursos/editar/page.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy
} from "firebase/firestore";
import { db, storage } from "@/app/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import {
  FiSave,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiLoader,
  FiBookOpen,
  FiHelpCircle,
} from "react-icons/fi";
import toast, { Toaster } from 'react-hot-toast';
import LessonForm from "@/app/ui/Components/Course/Component/LessonForm";
import QuizForm from "@/app/ui/Components/Course/Component/QuizForm";
import SectionForm from "@/app/ui/Components/Course/Component/SectionForm";
import { Course, Section, Lesson, QuizQuestion } from "@/app/ui/Components/Course/types";
import Modal from "@/app/ui/Components/Course/Component/ModalLessonDisplay";
import FluencySkeleton from "@/app/ui/Animations/FluencySkeleton";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import FluencySelect from "@/app/ui/Components/Input/select";
import FluencyTextarea from "@/app/ui/Components/Input/textarea";
import FluencyUpload from "@/app/ui/Components/Input/upload";

const generateUniqueId = () => `_${Math.random().toString(36).substr(2, 9)}`;

export default function EditCourseForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");

  // Course Details State
  const [course, setCourse] = useState<Partial<Course>>({});
  const [savingCourseDetails, setSavingCourseDetails] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Content Structure State
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);

  // Modal States
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [currentSectionIdForLesson, setCurrentSectionIdForLesson] = useState<string | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuizQuestion, setEditingQuizQuestion] = useState<QuizQuestion | null>(null);
  const [currentLessonForQuiz, setCurrentLessonForQuiz] = useState<Lesson | null>(null);

  // Data Fetching
  const fetchCourseAndContent = useCallback(async () => {
    if (!courseId) return;
    setLoadingContent(true);
    try {
      const courseRef = doc(db, "Cursos", courseId);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) {
        const courseData = { id: courseSnap.id, ...courseSnap.data() } as Course;
        setCourse(courseData);
        if (courseData.imageUrl) setImagePreview(courseData.imageUrl);
      } else {
        toast.error("Curso não encontrado.");
        router.push("/admin/cursos");
        return;
      }

      const sectionsQuery = query(collection(db, "Cursos", courseId, "sections"), orderBy("order", "asc"));
      const sectionsSnap = await getDocs(sectionsQuery);
      const sectionsData = await Promise.all(sectionsSnap.docs.map(async (sectionDoc) => {
        const section = { id: sectionDoc.id, ...sectionDoc.data(), lessons: [] } as unknown as Section;
        const lessonsQuery = query(collection(db, "Cursos", courseId, "sections", sectionDoc.id, "lessons"), orderBy("order", "asc"));
        const lessonsSnap = await getDocs(lessonsQuery);
        section.lessons = lessonsSnap.docs.map(lessonDoc => ({ id: lessonDoc.id, ...lessonDoc.data() } as Lesson));
        return section;
      }));
      setSections(sectionsData);

    } catch (error) {
      console.error("Error fetching course data: ", error);
      toast.error("Falha ao carregar dados do curso.");
    } finally {
      setLoadingContent(false);
    }
  }, [courseId, router]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/");
      return;
    }
    if (!courseId) {
      toast.error("ID do curso não encontrado na URL.");
      router.push("/admin/cursos");
      return;
    }
    fetchCourseAndContent();
  }, [session, status, router, courseId, fetchCourseAndContent]);

  // Course Details Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCourse((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCourseDetails = async () => {
    if (!courseId || savingCourseDetails) return;
    setSavingCourseDetails(true);
    const toastId = toast.loading("Salvando detalhes do curso...");
    try {
      let imageUrl = course.imageUrl;
      if (imageFile) {
        const imageRef = ref(storage, `course_images/${courseId}/${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
        setImageFile(null);
      }

      const courseRef = doc(db, "Cursos", courseId);
      const { id, ...courseDetailsToUpdate } = { ...course, imageUrl };
      await updateDoc(courseRef, courseDetailsToUpdate);

      setCourse((prev: any) => ({ ...prev, imageUrl }));
      toast.success("Detalhes do curso atualizados!", { id: toastId });
    } catch (error) {
      console.error("Error updating course details: ", error);
      toast.error("Falha ao atualizar detalhes do curso.", { id: toastId });
    } finally {
      setSavingCourseDetails(false);
    }
  };

  const handleOpenSectionModal = (section: Section | null = null) => {
    setEditingSection(section);
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (sectionData: { title: string }) => {
    if (!courseId) return;
    const toastId = toast.loading(editingSection ? "Atualizando seção..." : "Criando seção...");
    try {
      if (editingSection) {
        const sectionRef = doc(db, "Cursos", courseId, "sections", editingSection.id);
        await updateDoc(sectionRef, { title: sectionData.title });
      } else {
        const newOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 0;
        const sectionsCol = collection(db, "Cursos", courseId, "sections");
        await addDoc(sectionsCol, { title: sectionData.title, order: newOrder });
      }
      await fetchCourseAndContent();
      setIsSectionModalOpen(false);
      toast.success(editingSection ? "Seção atualizada!" : "Seção criada!", { id: toastId });
    } catch (error) {
      console.error("Error saving section: ", error);
      toast.error("Falha ao salvar seção.", { id: toastId });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!courseId) return;

    if (
      !confirm(
        "Tem certeza que deseja excluir esta seção e TODAS as suas lições e anexos? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }
    const toastId = toast.loading("Excluindo seção e seu conteúdo...");
    try {
      const lessonsCollectionRef = collection(
        db,
        "Cursos",
        courseId,
        "sections",
        sectionId,
        "lessons"
      );
      const lessonsSnap = await getDocs(lessonsCollectionRef);
      const firestoreBatch = writeBatch(db);

      for (const lessonDoc of lessonsSnap.docs) {
        const lessonData = lessonDoc.data() as Lesson;
        
        if (lessonData.attachments && lessonData.attachments.length > 0) {
          for (const attachment of lessonData.attachments) {
            try {
              const storageRef = ref(storage, attachment.url);
              await deleteObject(storageRef);
              console.log(`Anexo "${attachment.name}" excluído do Storage.`);
            } catch (storageError: any) {
              console.error(
                `Falha ao excluir anexo "${attachment.name}" do Storage:`,
                storageError
              );
              if (storageError.code === 'storage/object-not-found') {
                  console.warn(`Anexo "${attachment.name}" já não existia no Storage. Ignorando.`);
              } else {
                  throw storageError;
              }
            }
          }
        }
        const lessonRef = doc(lessonsCollectionRef, lessonDoc.id);
        firestoreBatch.delete(lessonRef);
      }
      await firestoreBatch.commit();

      const sectionRef = doc(db, "Cursos", courseId, "sections", sectionId);
      await deleteDoc(sectionRef);
      await fetchCourseAndContent();
      toast.success("Seção e todo o seu conteúdo excluídos com sucesso!", { id: toastId });
    } catch (error: any) {
      console.error("Erro ao excluir seção e seu conteúdo: ", error);
      toast.error(`Falha ao excluir seção: ${error.message || 'Erro desconhecido'}`, { id: toastId });
    }
  };

  // Lesson
  const handleOpenLessonModal = (sectionId: string, lesson: Lesson | null = null) => {
    setCurrentSectionIdForLesson(sectionId);
    setEditingLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (lessonData: Omit<Lesson, 'id' | 'order'>) => {
    if (!courseId || !currentSectionIdForLesson) return;
      const toastId = toast.loading(editingLesson ? "Atualizando lição..." : "Criando lição...");
      try {
          const sectionRef = collection(db, "Cursos", courseId, "sections", currentSectionIdForLesson, "lessons");
          let lessonDocRef;

          if (editingLesson) {
              lessonDocRef = doc(sectionRef, editingLesson.id);
              const dataToUpdate = {
                  ...lessonData,
                  contentBlocks: lessonData.contentBlocks.map(block => {
                      if (block.type === 'text') return { ...block, content: block.content?.trim() || null };
                      if (block.type === 'video') return { ...block, url: block.url?.trim() || null };
                      return block;
                  }),
              };
              await updateDoc(lessonDocRef, dataToUpdate);
            } else {
              // Create new lesson
              const currentSection = sections.find(s => s.id === currentSectionIdForLesson);
              const newOrder = currentSection && currentSection.lessons.length > 0 ? Math.max(...currentSection.lessons.map(l => l.order)) + 1 : 0;
              const newLessonData = {
                  ...lessonData,
                  order: newOrder,
                  quiz: [], 
                  attachments: [] 
              };
              const docRef = await addDoc(sectionRef, newLessonData);
              lessonDocRef = docRef; 
              setEditingLesson({ ...newLessonData, id: docRef.id } as Lesson); 
          }

          await fetchCourseAndContent();
          const updatedSection = sections.find(s => s.id === currentSectionIdForLesson);
          const latestLesson = updatedSection?.lessons?.find(l => l.id === (editingLesson?.id || lessonDocRef?.id));

          if (latestLesson) {
              setEditingLesson(latestLesson);
              setCurrentLessonForQuiz(latestLesson);
          }

          toast.success(editingLesson ? "Lição atualizada!" : "Lição criada!", { id: toastId });
      } catch (error) {
        console.error("Error saving lesson: ", error);
        toast.error("Falha ao salvar lição.", { id: toastId });
      }
  };

  // Handler for when attachments are updated from LessonForm
  const handleAttachmentsUpdated = (updatedLesson: Lesson) => {
      setEditingLesson(updatedLesson);
      setSections(prevSections =>
          prevSections.map(section => {
              if (section.id === updatedLesson.sectionId) {
                  return {
                      ...section,
                      lessons: section.lessons.map(lesson =>
                          lesson.id === updatedLesson.id ? updatedLesson : lesson
                      )
                  };
              }
              return section;
          })
      );
      if (currentLessonForQuiz?.id === updatedLesson.id) {
          setCurrentLessonForQuiz(updatedLesson);
      }
  };

  const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
    if (!courseId || !confirm("Tem certeza que deseja excluir esta lição?")) return;
    const toastId = toast.loading("Excluindo lição...");
    try {
      const lessonRef = doc(db, "Cursos", courseId, "sections", sectionId, "lessons", lessonId);
      await deleteDoc(lessonRef);
      await fetchCourseAndContent();
      toast.success("Lição excluída!", { id: toastId });
    } catch (error) {
      console.error("Error deleting lesson: ", error);
      toast.error("Falha ao excluir lição.", { id: toastId });
    }
  };

  // --- Quiz
  const handleOpenQuizModal = (lesson: Lesson, question: QuizQuestion | null = null) => {
    setCurrentLessonForQuiz(lesson);
    setEditingQuizQuestion(question);
    setIsQuizModalOpen(true);
  };

  const handleAddNewQuizQuestionRequest = () => {
      setEditingQuizQuestion(null);
  };

  const handleRequestEditQuizQuestion = (questionToEdit: QuizQuestion) => {
      setEditingQuizQuestion(questionToEdit);
  };

  const handleSaveQuizQuestion = async (questionData: Omit<QuizQuestion, 'id'>) => {
      if (!courseId || !currentLessonForQuiz || !currentLessonForQuiz.sectionId) {
          toast.error("Erro interno: dados de curso ou lição faltando.");
          return;
      }
      const toastId = toast.loading(editingQuizQuestion ? "Atualizando questão..." : "Adicionando questão...");
      try {
          const lessonRef = doc(db, "Cursos", courseId, "sections", currentLessonForQuiz.sectionId, "lessons", currentLessonForQuiz.id);
          let updatedQuiz: QuizQuestion[];

          if (editingQuizQuestion) {
              updatedQuiz = (currentLessonForQuiz.quiz || []).map(q =>
                  q.id === editingQuizQuestion.id ? { ...q, ...questionData } : q
              );
          } else {
              const newQuestion = { ...questionData, id: generateUniqueId() };
              updatedQuiz = [...(currentLessonForQuiz.quiz || []), newQuestion];
          }

          await updateDoc(lessonRef, { quiz: updatedQuiz });
          await fetchCourseAndContent();
          const updatedSection = sections.find(s => s.id === currentLessonForQuiz.sectionId);
          const latestLesson = updatedSection?.lessons?.find(l => l.id === currentLessonForQuiz.id);

          if (latestLesson) {
            setCurrentLessonForQuiz(latestLesson);
          }

          setEditingQuizQuestion(null);
          toast.success(editingQuizQuestion ? "Questão atualizada!" : "Questão adicionada!", { id: toastId });
      } catch (error) {
          console.error("Error saving quiz question: ", error);
          toast.error("Falha ao salvar questão do quiz.", { id: toastId });
      }
  };

  const handleDeleteQuizQuestion = async (lesson: Lesson, questionId: string) => {
      if (!courseId || !lesson.sectionId || !confirm("Tem certeza que deseja excluir esta questão do quiz?")) return;
      const toastId = toast.loading("Excluindo questão...");
      try {
          const lessonRef = doc(db, "Cursos", courseId, "sections", lesson.sectionId, "lessons", lesson.id);
          const updatedQuiz = (lesson.quiz || []).filter(q => q.id !== questionId);
          await updateDoc(lessonRef, { quiz: updatedQuiz });
          await fetchCourseAndContent();
          toast.success("Questão excluída!", { id: toastId });
      } catch (error) {
          console.error("Error deleting quiz question: ", error);
          toast.error("Falha ao excluir questão.", { id: toastId });
      }
  };

  // Reordering Handlers
  const handleMove = async (direction: 'up' | 'down', type: 'section' | 'lesson', sectionId: string, lessonId?: string) => {
      if (!courseId) return;
      let items: (Section | Lesson)[] = type === 'section' ? [...sections] : sections.find(s => s.id === sectionId)?.lessons || [];
      const index = items.findIndex(item => item.id === (type === 'section' ? sectionId : lessonId));

      if (index === -1) return;
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === items.length - 1) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      const tempOrder = items[index].order;
      items[index].order = items[targetIndex].order;
      items[targetIndex].order = tempOrder;

      const batch = writeBatch(db);
      const basePath = collection(db, "Cursos", courseId, type === 'section' ? "sections" : `sections/${sectionId}/lessons`);

      const item1Ref = doc(basePath, items[index].id);
      batch.update(item1Ref, { order: items[index].order });

      const item2Ref = doc(basePath, items[targetIndex].id);
      batch.update(item2Ref, { order: items[targetIndex].order });

      const toastId = toast.loading("Reordenando...");
      try {
          await batch.commit();
          await fetchCourseAndContent();
          toast.success("Itens reordenados!", { id: toastId });
      } catch (error) {
          console.error("Error reordering items: ", error);
          toast.error("Falha ao reordenar.", { id: toastId });
      }
  };

  if (!session || session.user.role !== "admin") {
    return null;
  }

return (
    <div className="flex flex-col w-full p-4 bg-fluency-bg-light dark:bg-fluency-bg-dark min-h-screen">
      <Toaster position="top-center" toastOptions={{
        className: 'bg-white dark:bg-fluency-gray-800 text-gray-900 dark:text-white shadow-lg',
      }} />

      {/* Course Details Card */}
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-6 text-fluency-text-light dark:text-fluency-text-dark">
          Detalhes do Curso: {course.title || ''}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FluencyInput
            label="Título do Curso"
            name="title"
            value={course.title || ''}
            onChange={handleInputChange}
            required
            variant="solid"
          />

          <FluencyInput
            label="Idioma"
            name="language"
            value={course.language || ''}
            onChange={handleInputChange}
            required
            variant="solid"
          />

          <FluencyInput
            label="Duração Estimada"
            name="duration"
            value={course.duration || ''}
            onChange={handleInputChange}
            required
            variant="solid"
            placeholder="30 horas"
          />

          <FluencySelect
            label="Visibilidade"
            name="role"
            value={course.role || 'student'}
            onChange={handleInputChange}
            required
            variant="solid"
          >
            <option value="student">Estudante Básico</option>
            <option value="premium_student">Estudante Premium</option>
            <option value="all">Todos os Usuários</option>
          </FluencySelect>

          <div className="md:col-span-2">
            <FluencyTextarea
              label="Descrição do Curso"
              name="description"
              value={course.description || ''}
              onChange={handleInputChange}
              required
              rows={4}
              variant="solid"
            />
          </div>

          <div className="flex flex-row items-center justify-stretch gap-4 w-full"> 
            <FluencyUpload
              label="Imagem do Curso"
              variant="solid"
              accept="image/*"
              onFileChange={(file) => {
                setImageFile(file);
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setImagePreview(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              required
            />
            {imagePreview && <Image width={300} height={300} priority src={imagePreview} alt="Preview" className="h-20 w-auto" />}
          </div>
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t border-fluency-gray-200 dark:border-fluency-gray-700">
          <FluencyButton
            onClick={handleSaveCourseDetails}
            variant="confirm"
            disabled={savingCourseDetails}
            className="w-full md:w-auto"
          >
            {savingCourseDetails ? (
              <FiLoader className="animate-spin mr-2 w-5 h-5" />
            ) : (
              <FiSave className="mr-2 w-5 h-5" />
            )}
            Salvar Detalhes
          </FluencyButton>
        </div>
      </div>

      {/* Course Content Card */}
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-fluency-text-light dark:text-fluency-text-dark">
            Conteúdo do Curso
          </h2>
          <FluencyButton
            onClick={() => handleOpenSectionModal()}
            variant="solid"
            className="w-full md:w-auto"
          >
            <FiPlus className="mr-2 w-5 h-5" />
            Nova Seção
          </FluencyButton>
        </div>

        {loadingContent ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <FluencySkeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 bg-fluency-bg-light dark:bg-fluency-gray-800 rounded-xl">
            <p className="text-fluency-text-light dark:text-fluency-text-dark">
              Nenhuma seção adicionada
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <div key={section.id} className="bg-fluency-bg-light dark:bg-fluency-gray-800 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-fluency-gray-200 dark:border-fluency-gray-700">
                  <h3 className="text-lg font-semibold text-fluency-text-light dark:text-fluency-text-dark">
                    {section.order + 1}. {section.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      className="mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleMove('up', 'section', section.id)}
                      disabled={sectionIndex === 0}
                    >
                      <FiChevronUp className="w-4 h-4" />
                    </button>
                    <button 
                      className="mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleMove('down', 'section', section.id)}
                      disabled={sectionIndex === sections.length - 1}
                    >
                      <FiChevronDown className="w-4 h-4" />
                    </button>
                    <div
                      onClick={() => handleOpenSectionModal(section)}
                    >
                      <FiEdit2 className="w-5 h-5 cursor-pointer hover:text-fluency-blue-500 transition-colors text-fluency-blue-500 " />
                    </div>
                    <div
                      onClick={() => handleDeleteSection(section.id)}
                    >
                      <FiTrash2 className="w-5 h-5 cursor-pointer hover:text-fluency-red-500 transition-colors text-fluency-red-500 " />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {section.lessons.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="flex justify-between items-center p-3 bg-fluency-gray-50 dark:bg-fluency-pages-dark rounded-lg hover:bg-fluency-gray-100 dark:hover:bg-fluency-gray-700 transition-colors">
                      <div className="flex items-center gap-2">
                          <FiBookOpen className="text-fluency-blue-500 dark:text-fluency-blue-300" />
                          <span className="text-sm text-fluency-text-light dark:text-fluency-text-dark">
                              {lesson.order + 1}. {lesson.title}
                          </span>
                          {lesson.quiz && lesson.quiz.length > 0 && ( // <--- Changed here
                              <FiHelpCircle className="text-fluency-purple-500 dark:text-fluency-purple-300" />
                          )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleMove('up', 'lesson', section.id, lesson.id)}
                          disabled={lessonIndex === 0}
                          className="mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiChevronUp className="w-5 h-5 cursor-pointer hover:text-fluency-gray-500 transition-colors text-fluency-gray-500 " />
                        </button>
                        <button
                          onClick={() => handleMove('down', 'lesson', section.id, lesson.id)}
                          disabled={lessonIndex === section.lessons.length - 1}
                          className="mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiChevronDown className="w-5 h-5 cursor-pointer hover:text-fluency-gray-500 transition-colors text-fluency-gray-500 " />
                        </button>
                        <div
                          onClick={() => handleOpenLessonModal(section.id, lesson)}
                        >
                          <FiEdit2 className="w-5 h-5 cursor-pointer hover:text-fluency-blue-500 transition-colors text-fluency-blue-500 " />
                        </div>
                        <div
                          onClick={() => handleDeleteLesson(section.id, lesson.id)}
                        >
                          <FiTrash2 className="w-5 h-5 cursor-pointer hover:text-fluency-red-500 transition-colors text-fluency-red-500 " />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <FluencyButton
                  onClick={() => handleOpenLessonModal(section.id)}
                >
                  <FiPlus className="mr-2 w-4 h-4" />
                  Adicionar Lição
                </FluencyButton>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Keep modals the same but update their internal styling */}
      <Modal isOpen={isSectionModalOpen} onClose={() => setIsSectionModalOpen(false)} title={editingSection ? "Editar Seção" : "Nova Seção"}>
        <div className="space-y-4">
          <SectionForm 
            initialData={editingSection} 
            onSave={handleSaveSection} 
            onCancel={() => setIsSectionModalOpen(false)} 
          />
        </div>
      </Modal>

      <Modal isOpen={isLessonModalOpen} onClose={() => setIsLessonModalOpen(false)} title={editingLesson ? "Editar Lição" : "Adicionar Lição"}>
        {currentSectionIdForLesson && (
          <LessonForm
              initialData={editingLesson}
              sectionId={currentSectionIdForLesson}
              onSave={handleSaveLesson}
              onCancel={() => {
                  setIsLessonModalOpen(false);
                  setEditingLesson(null);
                  setCurrentSectionIdForLesson(null);
              }}
              onManageQuiz={handleOpenQuizModal}
              courseId={courseId || ''} // Pass courseId
              lessonId={editingLesson?.id || null} // Pass lessonId (null for new lessons)
              onAttachmentsUpdated={handleAttachmentsUpdated} // Pass the new handler
          />
        )}
      </Modal>

      <Modal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} title={editingQuizQuestion ? "Editar Questão do Quiz" : "Adicionar Questão ao Quiz"}>
         {currentLessonForQuiz && (
            <QuizForm
                lesson={currentLessonForQuiz}
                initialQuestionData={editingQuizQuestion} // Pass the question being edited (or null for new)
                onSaveQuestion={handleSaveQuizQuestion}
                onDeleteQuestion={handleDeleteQuizQuestion}
                onCancel={() => {
                    setIsQuizModalOpen(false);
                    setEditingQuizQuestion(null); // Clear edit state when closing quiz modal
                }}
                onAddNewQuestionRequest={handleAddNewQuizQuestionRequest} // New prop for QuizForm                        
                onRequestEditQuestion={handleRequestEditQuizQuestion} // <-- Pass the handler to QuizForm
            />
          )}
      </Modal>
    </div>
  );
};