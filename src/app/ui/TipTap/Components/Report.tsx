import { db } from "@/app/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { VscWholeWord } from "react-icons/vsc";
import FluencyButton from "../../Components/Button/button";
import toast from "react-hot-toast";

export default function Report() {
  const params = new URLSearchParams(window.location.search);
  const notebookId = params.get('notebook');
  const studentId = params.get('student');
  const [reportContent, setReportContent] = useState<string>('');
  const [openReport, setOpenReport] = useState(false);
  const [notebooks, setNotebooks] = useState<any[]>([]);

  const handleOpenReportModal = async (notebookId: string) => {
    const notebookRef = doc(db, `users/${studentId}/Notebooks/${notebookId}`);
    const notebookSnap = await getDoc(notebookRef);

    if (notebookSnap.exists()) {
      const currentReport = notebookSnap.data().classReport || '';
      setReportContent(currentReport);
    } else {
      setReportContent('');
    }
  };

  useEffect(() => {
    if (openReport && notebookId) {
      handleOpenReportModal(notebookId);
    }
  }, [openReport, notebookId]);

  const handleReportChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReportContent(e.target.value);
  };

  const handleUpdateReport = async () => {
    if (notebookId && studentId) {
      const notebookRef = doc(db, `users/${studentId}/Notebooks/${notebookId}`);
      await updateDoc(notebookRef, {
        classReport: reportContent,
      });

      const updatedNotebooks = notebooks.map((notebook: { id: string }) => {
        if (notebook.id === notebookId) {
          return { ...notebook, classReport: reportContent };
        }
        return notebook;
      });

      setNotebooks(updatedNotebooks);
      toast.success('Relatório de aula salvo!', {
        position: "top-center",
      });
    }
  };

  return (
    <div className="bg-gray-200 dark:bg-gray-950 p-2 px-3 rounded-md flex flex-col items-center justify-start gap-2">
      <div
        className="flex flex-row items-center gap-2 font-bold text-black dark:text-white dark:hover:text-amber-700 hover:text-amber-700 duration-300 ease-in-out transition-all cursor-pointer"
        onClick={() => setOpenReport(!openReport)}
      >
        <p>{openReport ? "Atualizar" : "Atualizar"}</p>
        <VscWholeWord className='text-xl' />
      </div>
      <div
        className={`transition-max-height duration-500 ease-in-out overflow-hidden w-full ${
          openReport ? "max-h-[300px]" : "max-h-0"
        }`}
      >
        <div className="px-1 py-2">
          <div className="mt-2 flex flex-col gap-2 w-full">
            <textarea
              className="w-full rounded-md bg-fluency-bg-light dark:bg-fluency-bg-dark p-2"
              rows={4}
              defaultValue={reportContent}
              placeholder="Descrição da aula"
              onChange={handleReportChange}
            />
            <FluencyButton variant="orange" onClick={handleUpdateReport} className="w-full">
              Salvar
            </FluencyButton>
          </div>
        </div>
      </div>
    </div>
  );
}
