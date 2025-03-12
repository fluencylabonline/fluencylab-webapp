'use client';
import { db } from "@/app/firebase";
import { collection, getDocs, serverTimestamp, addDoc, query, orderBy } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";

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
  const [isModalDescriptionOpen, setIsModalDescriptionOpen] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchNotebooks = async () => {
      try {
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
      }
    };

    if (professorID) fetchNotebooks();
  }, [professorID]);

  const handleOpenModalDescription = () => setIsModalDescriptionOpen(true);
  const handleCloseModalDescription = () => setIsModalDescriptionOpen(false);
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value);

  const createNotebook = async () => {
    try {
      const notebookRef = collection(db, `users/${professorID}/Notebooks`);
      const notebookData = {
        title: new Date().toLocaleDateString(),
        description: description || 'Documento sem descrição',
        createdAt: serverTimestamp(),
        professorId: professorID || '',
        content: '',
      };
      await addDoc(notebookRef, notebookData);
      toast.success('Aula nova criada!', { position: "top-center" });
      setDescription('');
      handleCloseModalDescription();
      const fetchNotebooks = async () => {
        const snapshot = await getDocs(query(collection(db, `users/${professorID}/Notebooks`), orderBy('createdAt', 'desc')));
        const updatedNotebooks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Notebook[];
        setNotebooks(updatedNotebooks);
      };
      await fetchNotebooks();
    } catch (error) {
      console.error('Error creating notebook:', error);
    }
  };

  const filteredNotebooks = notebooks.filter((notebook) => 
    notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notebook.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!session) return <p>Sem sessão iniciada</p>;

  return (
    <div className="w-full p-6 text-gray-900 dark:text-gray-100">
      <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col w-full lg:gap-8 md:gap-4 gap-1 mb-4 items-center">
        <h1 className="min-w-fit text-2xl font-bold">Suas aulas</h1>
        <FluencyInput
          type="text"
          placeholder="Buscar aula..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FluencyButton 
          onClick={handleOpenModalDescription} 
          variant="purple"
          className="lg:!min-w-fit md:!min-w-fit !min-w-full"
        >
          Criar Nova Aula
        </FluencyButton>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredNotebooks.length > 0 ? (
          filteredNotebooks.map((notebook) => (
            <Link 
              key={notebook.id} 
              href={{ pathname: `aulas/aula`, query: { title: notebook.description, notebook: notebook.id } }} 
              passHref
            >
              <div className="p-4 border rounded shadow cursor-pointer bg-white dark:bg-gray-800">
                <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">{notebook.description}</h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">{notebook.createdAt.toLocaleString()}</span>
              </div>
            </Link>
          ))
        ) : (
          <p>Nenhuma aula preparada com esse título.</p>
        )}
      </div>

      {isModalDescriptionOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-700 rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Criar Nova Aula</h2>
            <input
              type="text"
              placeholder="Descrição da aula"
              value={description}
              onChange={handleDescriptionChange}
              className="w-full border rounded px-3 py-2 mb-4 bg-white dark:bg-gray-800 dark:text-gray-100"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={handleCloseModalDescription} className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded">Cancelar</button>
              <button onClick={createNotebook} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded">Criar Aula</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}