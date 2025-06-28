import React, { useEffect, useState } from "react";
import { collection, DocumentData, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";
import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal";
import DOMPurify from "dompurify";
import { Editor } from "@tiptap/react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHistory, FaPaste, FaRedo } from "react-icons/fa";
import { ClipboardPenLine } from "lucide-react";
import SpinningLoader from "../../Animations/SpinningComponent";

interface VersionsModalProps {
  isOpen: boolean;
  onClose: any;
  editor: Editor;
}

interface VersionDoc {
  id: string;
  data: DocumentData;
}

const VersionsModal: React.FC<VersionsModalProps> = ({
  editor,
  isOpen,
  onClose,
}) => {
  const params = new URLSearchParams(window.location.search);
  const studentID = params.get("student") || "";
  const notebookID = params.get("notebook") || "";

  const [versions, setVersions] = useState<VersionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<VersionDoc | null>(
    null
  );

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        const versionsRef = collection(
          db,
          `users/${studentID}/Notebooks/${notebookID}/versions`
        );
        const versionsSnapshot = await getDocs(versionsRef);

        if (versionsSnapshot.empty) {
          setLoading(false);
          return;
        }

        const fetchedVersions: VersionDoc[] = versionsSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            data: doc.data(),
          })
        );

        // Sort versions by date/time (newest first)
        const sortedVersions = fetchedVersions.sort((a, b) => {
          const [dayA, monthA, yearA] = a.data.date.split("/").map(Number);
          const [hourA, minuteA] = a.data.time.split(":").map(Number);
          const dateA = new Date(yearA, monthA - 1, dayA, hourA, minuteA);

          const [dayB, monthB, yearB] = b.data.date.split("/").map(Number);
          const [hourB, minuteB] = b.data.time.split(":").map(Number);
          const dateB = new Date(yearB, monthB - 1, dayB, hourB, minuteB);

          return dateB.getTime() - dateA.getTime();
        });

        setVersions(sortedVersions);
        setSelectedVersion(sortedVersions[0]);
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

  const pasteContent = () => {
    if (editor && selectedVersion) {
      editor.chain().focus().insertContent(selectedVersion.data.content).run();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed z-50 inset-0 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative bg-fluency-pages-light dark:bg-fluency-gray-900 rounded-xl shadow-xl w-full max-w-5xl h-[80vh] overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="sticky top-0 z-10 bg-fluency-gray-100 dark:bg-fluency-gray-900 p-4 shadow-sm">
                <FluencyCloseButton onClick={onClose} />

                <div className="flex justify-center items-center gap-2">
                  <FaHistory className="text-fluency-blue-500" />
                  <h3 className="text-xl font-bold">Histórico de Versões</h3>
                </div>
              </div>

              <div className="p-4 pb-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                {loading ? (
                  <motion.div
                    className="flex justify-center items-center h-64"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <SpinningLoader />
                  </motion.div>
                ) : versions.length === 0 ? (
                  <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhuma versão encontrada
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-row gap-4 w-full justify-between items-center bg-fluency-gray-50 dark:bg-fluency-gray-800 rounded-lg p-3">
                      <select
                        className="w-full px-3 py-2 bg-white dark:bg-fluency-gray-700 rounded-lg border border-fluency-gray-200 dark:border-fluency-gray-600"
                        value={selectedVersion?.id || ""}
                        onChange={(e) => {
                          const version = versions.find(
                            (v) => v.id === e.target.value
                          );
                          if (version) setSelectedVersion(version);
                        }}
                      >
                        {versions.map((version) => (
                          <option key={version.id} value={version.id}>
                            {formatDateTime(
                              version.data.date,
                              version.data.time
                            )}
                          </option>
                        ))}
                      </select>
                      <motion.button
                        className="p-3 bg-fluency-green-500 hover:bg-fluency-green-600 dark:bg-fluency-green-600 hover:dark:bg-fluency-green-700 text-white rounded-md transition-colors"
                        onClick={pasteContent}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ClipboardPenLine className="w-4 h-4" />
                      </motion.button>
                    </div>

                    {/* Preview Section */}
                    {selectedVersion && (
                      <motion.div
                        className="bg-fluency-gray-50 dark:bg-fluency-gray-800 rounded-lg p-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div
                          className="bg-white dark:bg-fluency-gray-700 rounded-lg p-4 h-64 overflow-y-auto mb-4"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              selectedVersion.data.content
                            ),
                          }}
                        />
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDateTime(
                              selectedVersion.data.date,
                              selectedVersion.data.time
                            )}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VersionsModal;
