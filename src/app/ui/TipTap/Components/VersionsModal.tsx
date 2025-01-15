import React, { useEffect, useState } from "react";
import { collection, getDocs, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/app/firebase";
import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal";
import DOMPurify from "dompurify";
import { Editor } from "@tiptap/react";

interface VersionsModalProps {
  isOpen: boolean;
  onClose: any;
  editor: Editor;
}

interface VersionDoc {
  id: string;
  data: DocumentData;
}

const VersionsModal: React.FC<VersionsModalProps> = ({ editor, isOpen, onClose }) => {
  const params = new URLSearchParams(window.location.search);
  const studentID = params.get("student") || "";
  const notebookID = params.get("notebook") || "";

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

        const sortedVersions = fetchedVersions.sort((b, a) => {
          // Parse the dates explicitly
          const [dayA, monthA, yearA] = a.data.date.split("/").map(Number);
          const [hourA, minuteA] = a.data.time.split(":").map(Number);
          const dateA = new Date(yearA, monthA - 1, dayA, hourA, minuteA);
        
          const [dayB, monthB, yearB] = b.data.date.split("/").map(Number);
          const [hourB, minuteB] = b.data.time.split(":").map(Number);
          const dateB = new Date(yearB, monthB - 1, dayB, hourB, minuteB);
        
          // Sort in ascending order
          return dateA.getTime() - dateB.getTime();
        });
        

        setVersions(sortedVersions);

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

  const formatDateTime = (date: string, time: string) => {
    const [day, month, year] = date.split("/").map(Number);
    const [hour, minutes] = time.split(":").map(Number);
    const formattedDate = new Date(year, month - 1, day, hour, minutes);

    return formattedDate.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleVersionClick = (content: string) => {
    setSelectedContent(content);
  };

  const pasteContentFromFirestore = (content: typeof selectedContent) => {
    if (editor) {
      editor.chain().focus().insertContent(content).run();
    }
    onClose();
  };

  if (!isOpen) return null;

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
                      <div className="flex flex-col items-start gap-1">
                        <p className="text-sm font-bold">{formatDateTime(version.data.date, version.data.time)}</p>
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
                          onClick={() => pasteContentFromFirestore(selectedContent)}
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
