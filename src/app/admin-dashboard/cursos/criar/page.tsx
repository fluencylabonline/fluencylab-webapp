"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "@/app/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencySkeleton from "@/app/ui/Animations/FluencySkeleton";
import FluencyInput from "@/app/ui/Components/Input/input";
import FluencyTextarea from "@/app/ui/Components/Input/textarea";
import FluencySelect from "@/app/ui/Components/Input/select";
import FluencyUpload from "@/app/ui/Components/Input/upload";

interface NewCourseData {
  title: string;
  language: string;
  description: string;
  imageUrl: string;
  duration: string;
  role: string;
  sections: any[];
  lessons: any[];
  quizzes: any[];
  createdAt: any;
}

const CreateCoursePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<Omit<NewCourseData, 'imageUrl' | 'createdAt' | 'sections' | 'lessons' | 'quizzes'>>({
    title: "",
    language: "",
    description: "",
    duration: "",
    role: "student",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/");
    } else {
      setLoading(false);
    }
  }, [session, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imageFile) return toast.error("Selecione uma imagem para o curso.");
    if (isSubmitting) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Criando curso...");

    try {
      // Upload image
      const imageName = `${Date.now()}_${imageFile.name}`;
      const imageRef = ref(storage, `course_images/${imageName}`);
      const uploadResult = await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      // Create course document
      const newCourse: NewCourseData = {
        ...formData,
        imageUrl,
        sections: [],
        lessons: [],
        quizzes: [],
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "courses"), newCourse);
      toast.success("Curso criado com sucesso!", { id: toastId });
      router.push("/admin-dashboard/cursos");
    } catch (error) {
      console.error("Error creating course: ", error);
      toast.error("Falha ao criar o curso.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !session || session.user.role !== "admin") {
    return <FluencySkeleton className="w-full h-screen" />;
  }

  return (
    <div className="flex flex-col w-full p-4 bg-fluency-bg-light dark:bg-fluency-bg-dark h-full">
      <Toaster position="top-center" toastOptions={{
        className: 'bg-white dark:bg-fluency-gray-800 text-gray-900 dark:text-white shadow-lg',
      }} />

      <form onSubmit={handleSubmit} className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 lg:p-6 rounded-lg shadow-lg space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <FluencyInput
              label="Título do Curso"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Introdução ao Inglês"
            />

            <FluencyInput
              label="Idioma"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              required
              placeholder="Inglês"
            />

            <FluencyInput
              label="Duração Estimada"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              required
              placeholder="30 horas"
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <FluencySelect
              label="Visibilidade"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="student">Estudante</option>
              <option value="teacher">Professor</option>
              <option value="all">Todos os Usuários</option>
            </FluencySelect>

            <FluencyUpload 
              label="Imagem do Curso"
              variant="solid"
              accept="image/*"
              onFileChange={handleFileChange}
              required
            />
          </div>
        </div>

        <FluencyTextarea 
          label="Descrição do Curso"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={4}
          placeholder="Descreva os objetivos e conteúdo deste curso..."
        />

        <div className="flex justify-end border-t border-fluency-gray-200 dark:border-fluency-gray-700">
          <FluencyButton
            type="submit"
            variant="confirm"
            disabled={isSubmitting}
            className="w-full md:w-auto"
          >
            <FiSave className="mr-2 w-5 h-5" />
            {isSubmitting ? 'Salvando...' : 'Criar Curso'}
          </FluencyButton>
        </div>
      </form>
    </div>
  );
};

export default CreateCoursePage;