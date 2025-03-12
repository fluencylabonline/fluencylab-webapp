import { db } from "@/app/firebase";
import { collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import FluencyCloseButton from "../../Components/ModalComponents/closeModal";
import { Editor } from "@tiptap/react";
import FluencyButton from "../../Components/Button/button";
import FluencyInput from "../../Components/Input/input";

interface Notebook {
  id: string;
  data: DocumentData;
}

interface AulasPreparadasProps {
  editor: Editor;
  onClose: () => void;
  isOpen: boolean;
}

const AulasPreparadas: React.FC<AulasPreparadasProps> = ({ editor, onClose, isOpen }) => {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [seeMyNotebooks, setSeeMyNotebooks] = useState(true);
  const [previewNotebook, setPreviewNotebook] = useState<Notebook | null>(null);

  // Inserts notebook content into the editor and closes the modal
  const pasteContentFromFirestore = (content: string) => {
    if (editor) {
      editor.chain().focus().insertContent(content).run();
    }
    onClose();
  };

  // Fetch notebooks based on the toggle state
  const fetchNotebooks = async () => {
    try {
      let fetchedNotebooks: Notebook[] = [];
      if (seeMyNotebooks) {
        if (!session?.user?.id) return;
        const myNotebooksRef = collection(db, `users/${session.user.id}/Notebooks`);
        const snapshot = await getDocs(myNotebooksRef);
        fetchedNotebooks = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
      } else {
        // Query users with role 'teacher'
        const teachersQuery = query(
          collection(db, "users"),
          where("role", "==", "teacher")
        );
        const teachersSnapshot = await getDocs(teachersQuery);
        for (const teacherDoc of teachersSnapshot.docs) {
          const teacherID = teacherDoc.id;
          const teacherNotebooksRef = collection(db, `users/${teacherID}/Notebooks`);
          const notebooksSnapshot = await getDocs(teacherNotebooksRef);
          const teacherNotebooks = notebooksSnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }));
          fetchedNotebooks = fetchedNotebooks.concat(teacherNotebooks);
        }
      }
      setNotebooks(fetchedNotebooks);
    } catch (error) {
      console.error("Error fetching notebooks: ", error);
    }
  };

  useEffect(() => {
    fetchNotebooks();
  }, [seeMyNotebooks, session]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredNotebooks = notebooks.filter((nb) => {
    const description = nb.data.description;
    return typeof description === "string" && description.toLowerCase().includes(searchTerm);
  });

  const handlePreview = (notebook: Notebook) => {
    setPreviewNotebook(notebook);
  };

  if (!isOpen) return null;
  if (!session) return <p>Sem sessão iniciada</p>;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg shadow-xl transform transition-all w-[80vw] h-[80vh] overflow-y-scroll p-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-center mb-4">
              <FluencyCloseButton onClick={onClose} />
              <h3 className="text-2xl font-bold leading-6">Aulas de Professores</h3>
            </div>

            {/* Toggle buttons */}
            <div className="w-full mb-4 flex flex-row justify-center gap-4">
              <FluencyInput
                type="text"
                placeholder="Buscar por descrição..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <div className="w-full flex flex-row">
                <FluencyButton
                    onClick={() => setSeeMyNotebooks(true)}
                    variant={`${seeMyNotebooks ? 'purple' : 'gray'}`}
                >
                    Minhas aulas
                </FluencyButton>
                <FluencyButton
                    onClick={() => setSeeMyNotebooks(false)}
                    variant={`${!seeMyNotebooks ? 'purple' : 'gray'}`}
                >
                    Todas as aulas
                </FluencyButton>
              </div>
            </div>

            <div className="flex flex-col md:flex-row w-full">
              <div className={`flex flex-col w-full ${previewNotebook ? "md:w-1/2" : "w-full"}`}>
                <ul className="flex flex-col gap-1 w-full">
                  {filteredNotebooks.map((nb) => (
                    <li
                      key={nb.id}
                      className="flex flex-row gap-2 justify-between items-center p-2 border-b border-gray-300 dark:border-gray-600"
                    >
                      <p className="text-lg font-semibold">{nb.data.description}</p>
                      <div className="flex gap-2">
                        <button
                          className="p-1 px-3 bg-fluency-green-500 hover:bg-fluency-green-600 dark:bg-fluency-green-500 dark:hover:bg-fluency-green-600 duration-300 ease-in-out text-white font-semibold rounded-md"
                          onClick={() => pasteContentFromFirestore(nb.data.content)}
                        >
                          Colar
                        </button>
                        <button
                          className="p-1 px-3 bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600 duration-300 ease-in-out text-white font-semibold rounded-md"
                          onClick={() => handlePreview(nb)}
                        >
                          Visualizar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {previewNotebook && (
                <div className="w-full md:w-1/2 border-l border-gray-300 dark:border-gray-600 pl-4 mt-4 md:mt-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Visualização</h3>
                    <button
                      onClick={() => setPreviewNotebook(null)}
                      className="text-red-500 font-semibold"
                    >
                      Fechar
                    </button>
                  </div>
                  <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto">
                    {/* Render the notebook content as HTML */}
                    <div
                      className="text-lg"
                      dangerouslySetInnerHTML={{ __html: previewNotebook.data.content }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AulasPreparadas;
