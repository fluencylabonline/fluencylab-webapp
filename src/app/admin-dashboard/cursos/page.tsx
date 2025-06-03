"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import ConfirmationModal from "@/app/ui/Components/ModalComponents/confirmation";
import FluencySkeleton from "@/app/ui/Animations/FluencySkeleton";
import FluencyButton from '@/app/ui/Components/Button/button';
import { Course } from "@/app/ui/Components/Course/types";

const AdminCoursesPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDeleteId, setCourseToDeleteId] = useState<string | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user.role !== "admin") {
      router.push("/");
      return;
    }

    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const coursesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];
        setCourses(coursesData);
      } catch (error) {
        toast.error("Falha ao carregar os cursos.");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [session, status, router]);

  const handleDeleteCourse = async () => {
    if (!courseToDeleteId) return;

    setShowDeleteConfirm(false);
    const toastId = toast.loading('Excluindo curso...');

    try {
      await deleteDoc(doc(db, "courses", courseToDeleteId));
      setCourses(courses.filter(course => course.id !== courseToDeleteId));
      toast.success('Curso excluído com sucesso!', { id: toastId });
    } catch (error) {
      toast.error('Falha ao excluir o curso.', { id: toastId });
    } finally {
      setCourseToDeleteId(null);
    }
  };

  const openDeleteConfirmModal = (courseId: string) => {
    setCourseToDeleteId(courseId);
    setShowDeleteConfirm(true);
  };

  if (loadingCourses || !session || session.user.role !== "admin") {
    return <FluencySkeleton className="w-full h-screen" />;
  }

  return (
    <div className="flex flex-col w-full p-4 bg-fluency-bg-light dark:bg-fluency-bg-dark h-full">
      <Toaster position="top-center" toastOptions={{
        className: 'bg-white dark:bg-fluency-gray-800 text-gray-900 dark:text-white shadow-lg',
      }} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-fluency-gray-800 dark:text-fluency-gray-100">
          Gerenciar Cursos
        </h1>
        <Link href="/admin-dashboard/cursos/criar" className="w-full md:w-auto">
          <FluencyButton variant="confirm" className="w-full md:w-auto">
            <FiPlus className="mr-2 w-5 h-5" />
            Novo Curso
          </FluencyButton>
        </Link>
      </div>

      {/* Content Section */}
      {courses.length === 0 ? (
        <div className="flex flex-1 justify-center items-center p-8">
          <p className="text-fluency-gray-600 dark:text-fluency-gray-300 text-lg">
            Nenhum curso encontrado.
          </p>
        </div>
      ) : (
        <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-fluency-gray-200 dark:divide-fluency-gray-700">
              <thead className="bg-fluency-blue-50 dark:bg-fluency-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-fluency-gray-800 dark:text-fluency-gray-100">
                    Título
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-fluency-gray-800 dark:text-fluency-gray-100">
                    Idioma
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-fluency-gray-800 dark:text-fluency-gray-100">
                    Duração
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-fluency-gray-800 dark:text-fluency-gray-100">
                    Acesso
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-fluency-gray-800 dark:text-fluency-gray-100">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fluency-gray-200 dark:divide-fluency-gray-700">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-fluency-blue-50/50 dark:hover:bg-fluency-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-fluency-gray-800 dark:text-fluency-gray-100">
                      {course.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-fluency-gray-600 dark:text-fluency-gray-300">
                      {course.language}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-fluency-gray-600 dark:text-fluency-gray-300">
                      {course.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-fluency-gray-600 dark:text-fluency-gray-300">
                      {course.role === 'student' ? 'Básico' : 'Premium'}
                    </td>
                    <td className="flex justify-end flex-row px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                      <Link href={`/admin-dashboard/cursos/editar?id=${course.id}`}>
                          <FiEdit className="w-5 h-5" />
                      </Link>
                      <div 
                        className="cursor-pointer hover:text-fluency-red-500 transition-colors"
                        onClick={() => openDeleteConfirmModal(course.id)}
                      >
                        <FiTrash2 className="w-5 h-5 cursor-pointer hover:text-fluency-red-500 transition-colors text-fluency-red-500 " />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteCourse}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este curso permanentemente?"
        confirmButtonText="Excluir"
        cancelButtonText="Cancelar"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default AdminCoursesPage;