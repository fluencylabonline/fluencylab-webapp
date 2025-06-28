'use client';
import { db } from "@/app/firebase";
import { collection, getDocs, serverTimestamp, addDoc, query, orderBy } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import InputModal from "@/app/ui/Components/ModalComponents/input";
import { motion } from "framer-motion";
import { FiPlus, FiFileText } from "react-icons/fi";
import { format } from "date-fns";
import LoadingAnimation from "@/app/ui/Animations/LoadingAnimation";

interface Notebook {
  professorId: string;
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  content: any;
}

export default function AulasPreparadas() {
  const { data: session } = useSession();
  const professorID = session?.user.id;

  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotebooks = async () => {
      try {
        setLoading(true);
        const notebookRef = collection(db, `users/${professorID}/Notebooks`);
        const q = query(notebookRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const notebookList: Notebook[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          notebookList.push({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(0),
            professorId: data.professorId || '',
            content: data.content || '',
          });
        });
        setNotebooks(notebookList);
      } catch (error) {
        console.error('Error fetching notebooks:', error);
        toast.error('Erro ao carregar aulas', { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    if (professorID) fetchNotebooks();
  }, [professorID]);

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => {
    setDescription('');
    setIsCreateModalOpen(false);
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value);

  const createNotebook = async () => {
    if (!description.trim()) {
      toast.error('Adicione uma descrição', { position: "top-center" });
      return;
    }
    
    try {
      const notebookRef = collection(db, `users/${professorID}/Notebooks`);
      const notebookData = {
        title: new Date().toLocaleDateString('pt-BR'),
        description: description,
        createdAt: serverTimestamp(),
        professorId: professorID || '',
        content: '',
      };
      await addDoc(notebookRef, notebookData);
      toast.success('Aula nova criada!', { position: "top-center" });
      setDescription('');
      handleCloseCreateModal();
      
      // Update state with new notebook
      const newNotebook = {
        id: '', // Will be set after fetch
        title: notebookData.title,
        description: notebookData.description,
        createdAt: new Date(),
        professorId: professorID || '',
        content: '',
      };
      
      // Re-fetch notebooks to update the list
      const snapshot = await getDocs(query(collection(db, `users/${professorID}/Notebooks`), orderBy('createdAt', 'desc')));
      const updatedNotebooks = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title || '',
          description: doc.data().description || '',
          createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(0),
          professorId: doc.data().professorId || '',
          content: doc.data().content || '',
      })) as Notebook[];
      setNotebooks(updatedNotebooks);

    } catch (error) {
      console.error('Error creating notebook:', error);
      toast.error('Erro ao criar aula.', { position: "top-center" });
    }
  };

  const filteredNotebooks = notebooks.filter((notebook) => 
    notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notebook.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!session) return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg">Sem sessão iniciada</p>
    </div>
  );

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full p-4 sm:p-6">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-bold mb-4">Suas aulas</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <FluencyInput
              type="text"
              placeholder="Buscar aula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          
          <FluencyButton 
            onClick={handleOpenCreateModal}
            variant="purple"
            className="flex items-center justify-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Criar Nova Aula</span>
          </FluencyButton>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingAnimation />
        </div>
      ) : filteredNotebooks.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredNotebooks.map((notebook) => (
            <motion.div 
              key={notebook.id}
              variants={item}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Link 
                href={{ pathname: `aulas/aula`, query: { title: notebook.description, notebook: notebook.id } }} 
                passHref
              >
                <div className="h-full flex flex-col p-5 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 cursor-pointer">
                  <div className="flex items-center mb-4">
                    <div className="bg-fluency-purple-100 dark:bg-fluency-purple-900 p-2 rounded-lg mr-3">
                      <FiFileText className="w-6 h-6 text-fluency-purple-600 dark:text-fluency-purple-300" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                        {notebook.description}
                      </h2>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(notebook.createdAt, "dd 'de' MMMM 'de' yyyy")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {notebook.title}
                      </span>
                      <span className="text-xs px-4 py-1 bg-fluency-blue-100 dark:bg-fluency-blue-900 text-fluency-blue-800 dark:text-fluency-blue-200 rounded-md">
                        Aula
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="flex flex-col items-center justify-center py-12 bg-fluency-gray-100 dark:bg-fluency-gray-900 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FiFileText className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-500 mb-2">Nenhuma aula encontrada</h3>
          <p className="text-gray-500 text-center max-w-md">
            {searchQuery 
              ? `Nenhuma aula corresponde à busca por "${searchQuery}"` 
              : 'Você ainda não criou nenhuma aula. Clique no botão acima para começar.'}
          </p>
        </motion.div>
      )}

      <InputModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onConfirm={createNotebook}
        title="Criar Nova Aula"
        placeholder="Descrição da aula"
        value={description}
        onChange={handleDescriptionChange}
        confirmButtonText="Criar Aula"
        cancelButtonText="Cancelar"
      />
    </div>
  );
}