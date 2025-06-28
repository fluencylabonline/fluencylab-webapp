"use client";
import React, { useState, useEffect } from "react";
import {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { toast } from "react-hot-toast";
import {
  FaFilePdf,
  FaRegFileAudio,
  FaRegFileImage,
  FaRegFileVideo,
  FaFileAlt,
} from "react-icons/fa";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import ConfirmationModal from "@/app/ui/Components/ModalComponents/confirmation";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload } from "lucide-react"; // Assuming CloudUpload is imported correctly

interface AlunoMateriaisProps {
  studentId: string | null;
}

function AlunoMateriais({ studentId }: AlunoMateriaisProps) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [isDeleteFileModalOpen, setDeleteFileModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const storage = getStorage();

  const fetchMaterialsReal = async () => {
    if (!studentId) return;
    try {
      const materialsRef = ref(
        storage,
        `alunosmateriais/${studentId}/materiais/archives`
      );
      const materialList = await listAll(materialsRef);
      const materialUrls = await Promise.all(
        materialList.items.map(async (item) => {
          const downloadUrl = await getDownloadURL(item);
          return { name: item.name, url: downloadUrl };
        })
      );
      setMaterials(materialUrls);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Erro ao carregar materiais.", { position: "top-center" });
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchMaterialsReal();
    }
  }, [studentId]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !studentId) return;

    const file = files[0];
    // Check if the file already exists before uploading
    const fileExists = materials.some(
      (material) => material.name === file.name
    );
    if (fileExists) {
      toast.error("Um arquivo com este nome já existe!", {
        position: "top-center",
      });
      // Clear the input to allow re-selection of the same file if desired
      event.target.value = '';
      return;
    }

    const fileName = `alunosmateriais/${studentId}/materiais/archives/${file.name}`;
    const storageRef = ref(storage, fileName);

    try {
      await uploadBytes(storageRef, file);
      toast.success("Arquivo salvo!", { position: "top-center" });
      fetchMaterialsReal(); // Refresh the list of materials
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erro ao salvar arquivo!", { position: "top-center" });
    } finally {
      // Clear the input field to allow uploading the same file again if needed
      event.target.value = '';
    }
  };

  const renderMaterialIcon = (fileName: string) => {
    const fileType = fileName.split(".").pop()?.toLowerCase();
    if (fileType === "pdf") return <FaFilePdf className="w-5 h-5" />;
    if (["mp3", "wav"].includes(fileType || ""))
      return <FaRegFileAudio className="w-5 h-5" />;
    if (["mp4", "mov"].includes(fileType || ""))
      return <FaRegFileVideo className="w-5 h-5" />;
    if (fileType === "txt") return <FaFileAlt className="w-5 h-5" />;
    if (["jpg", "jpeg", "png", "gif"].includes(fileType || ""))
      return <FaRegFileImage className="w-5 h-5" />;
    return <FaFileAlt className="w-5 h-5" />;
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteFileClick = (fileName: string) => {
    setFileToDelete(fileName);
    setDeleteFileModalOpen(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete || !studentId) {
      toast.error("Erro: arquivo ou ID do aluno ausente.", { position: "top-center" });
      return;
    }
    const fileRef = ref(
      storage,
      `alunosmateriais/${studentId}/materiais/archives/${fileToDelete}`
    );
    try {
      await deleteObject(fileRef);
      toast.success("Arquivo deletado!", { position: "top-center" });
      fetchMaterialsReal(); // Refresh the list of materials
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Erro ao deletar arquivo!", { position: "top-center" });
    } finally {
      setDeleteFileModalOpen(false);
      setFileToDelete(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg px-2 overflow-hidden"
    >
      <ConfirmationModal
        isOpen={isDeleteFileModalOpen}
        onClose={() => setDeleteFileModalOpen(false)}
        onConfirm={confirmDeleteFile}
        title="Excluir Arquivo"
        message={`Tem certeza que deseja excluir o arquivo "${fileToDelete}"?`}
        confirmButtonText="Sim, Excluir"
        confirmButtonVariant="danger"
      />

      <div className="p-4 flex flex-row justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          Materiais
        </h2>
        {/* Hidden file input */}
        <input
          type="file"
          id="dropzone-file" // This ID is what the button's onClick targets
          className="hidden" // Keep it hidden
          onChange={handleFileUpload}
          aria-label="Upload de material"
        />
        {/* The upload button */}
        <button
          onClick={() => document.getElementById("dropzone-file")?.click()}
          className="px-2 py-2 rounded-md bg-fluency-blue-500 hover:bg-fluency-blue-600 text-white text-sm font-medium transition-colors duration-200 flex items-center gap-2"
          aria-label="Botão de Upload"
        >
          <CloudUpload className="w-4 h-4" />
        </button>
      </div>

      <div className="h-full w-full overflow-y-auto px-3">
        <AnimatePresence>
          {materials.length > 0 ? (
            <div className="flex flex-col gap-2 py-4">
              {materials.map((material, index) => (
                <motion.div
                  key={material.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: 2 }}
                  className="flex items-center justify-between p-1 rounded-lg bg-fluency-gray-100 dark:bg-fluency-gray-800 hover:bg-fluency-gray-200 dark:hover:bg-fluency-gray-700 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-fluency-blue-100 dark:bg-fluency-gray-700">
                      {renderMaterialIcon(material.name)}
                    </div>
                    <div className="max-w-[120px] overflow-hidden whitespace-nowrap">
                      <p className="font-medium truncate text-fluency-gray-800 dark:text-fluency-gray-100">
                        {material.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Download Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleDownload(material.url, material.name)
                      }
                      className="p-2 rounded-full bg-fluency-blue-100 dark:bg-fluency-blue-900 hover:bg-fluency-blue-200 dark:hover:bg-fluency-blue-800"
                      aria-label={`Baixar ${material.name}`}
                    >
                      <IoCloudDownloadOutline className="w-5 h-5 text-fluency-blue-700 dark:text-fluency-blue-300" />
                    </motion.button>

                    {/* Delete Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteFileClick(material.name)}
                      className="p-2 rounded-full bg-fluency-red-100 dark:bg-fluency-red-900 hover:bg-fluency-red-200 dark:hover:bg-fluency-red-800"
                      aria-label={`Deletar ${material.name}`}
                    >
                      <MdDelete className="w-5 h-5 text-fluency-red-700 dark:text-fluency-red-300" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center pb-2"
            >
              <div className="bg-fluency-gray-100 dark:bg-fluency-gray-800 rounded-full p-4 mb-1">
                <IoCloudDownloadOutline className="w-4 h-4 text-fluency-gray-500 dark:text-fluency-gray-400" />
              </div>
              <p className="text-fluency-gray-600 dark:text-fluency-gray-400">
                Nenhum material disponível
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default AlunoMateriais;