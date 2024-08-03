import React, { useEffect, useState } from "react";
import { collection, getDocs, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/app/firebase";
import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal"; // Assume you have this component
import DOMPurify from 'dompurify'; // Import DOMPurify

interface VersionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentID: string;
  notebookID: string;
  pasteContentFromFirestore: (content: string) => void; // Add this prop
}

interface VersionDoc {
  id: string;
  data: DocumentData;
}

const VersionsModal: React.FC<VersionsModalProps> = ({ studentID, notebookID, isOpen, onClose, pasteContentFromFirestore }) => {
  const [versions, setVersions] = useState<VersionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const versionsRef = collection(db, `users/${studentID}/Notebooks/${notebookID}/versions`);
        const versionsSnapshot: QuerySnapshot<DocumentData> = await getDocs(versionsRef);
        const fetchedVersions: VersionDoc[] = versionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
        
        // Sort versions by date and time
        const sortedVersions = fetchedVersions.sort((a, b) => {
          const dateA = new Date(`${a.data.date} ${a.data.time}`);
          const dateB = new Date(`${b.data.date} ${b.data.time}`);
          return dateB.getTime() - dateA.getTime(); // Sort in descending order
        });

        setVersions(sortedVersions);
        
        // Set the last version's content as default selected content
        if (sortedVersions.length > 0) {
          setSelectedContent(sortedVersions[0].data.content);
        }
      } catch (error) {
        console.error("Error fetching versions: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, studentID, notebookID]);

  const handleVersionClick = (content: string) => {
    setSelectedContent(content);
  };

  const handlePasteContent = () => {
    if (selectedContent) {
      pasteContentFromFirestore(selectedContent);
    }
    onClose()
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-full mx-8 h-[80vh] overflow-y-scroll p-6 px-10">
          <div className="flex flex-col items-center justify-center">
            <FluencyCloseButton onClick={onClose} />
            <h3 className="text-2xl font-bold leading-6 mb-6">Histórico de versões</h3>
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <div className="flex overflow-hidden">
                <ul className="flex flex-col gap-2 items-end h-[65vh] overflow-hidden overflow-y-scroll w-[40%]">
                  {versions.map((version) => (
                    <li key={version.id} className="flex flex-row gap-3">
                      <div className="flex flex-col items-start gap-1"><p>Dia <strong className="font-bold">{version.data.date}</strong></p>
                           <p className="text-sm">às <strong className="font-bold">{version.data.time}</strong></p>
                      </div>
                      <button
                        className="p-1 px-3 bg-fluency-green-500 hover:bg-fluency-green-600 dark:bg-fluency-green-600 hover:dark:bg-fluency-green-700 duration-300 ease-in-out text-white dark:text-white font-semibold rounded-md"
                        onClick={() => handleVersionClick(version.data.content)}
                      >
                        Mostrar
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="w-[50%] pl-4">
                  {selectedContent ? (
                    <div>
                      <div className="flex flex-row items-center gap-1 mb-2">
                        <h4 className="text-xl font-semibold">Conteúdo Selecionado</h4>
                        <button
                          className="p-1 px-3 bg-fluency-green-500 hover:bg-fluency-green-600 dark:bg-fluency-green-600 hover:dark:bg-fluency-green-700 duration-300 ease-in-out text-white dark:text-white font-semibold rounded-md"
                          onClick={handlePasteContent}
                        >
                          Colar
                        </button>
                      </div>
                      <div
                        className="content-preview h-[60vh] overflow-hidden overflow-y-scroll"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedContent) }}
                      />
                    </div>
                  ) : (
                    <p>Selecione uma versão para ver o conteúdo.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionsModal;
