import { storage, db } from "@/app/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiChevronUp, FiChevronDown, FiTrash2, FiPlus, FiPaperclip, FiHelpCircle } from "react-icons/fi";
import { Lesson, QuizQuestion, TextContentBlock, VideoContentBlock, Attachment, LessonContentBlock } from "../types";
import FluencyButton from "../../Button/button";
import FluencyInput from "../../Input/input";
import FluencyTextarea from "../../Input/textarea";
import FluencyUpload from "../../Input/upload";
const generateUniqueId = () => `_${Math.random().toString(36).substr(2, 9)}`;

// Lesson Form Component
const LessonForm = ({
  initialData,
  sectionId,
  onSave,
  onCancel,
  onManageQuiz,
  courseId, // NEW: Pass courseId to LessonForm for attachment paths
  lessonId, // NEW: Pass lessonId to LessonForm for attachment paths
  onAttachmentsUpdated,
}: {
  initialData: Lesson | null;
  sectionId: string;
  onSave: (data: Omit<Lesson, "id" | "order">) => void; // Update onSave type to reflect new Lesson structure
  onCancel: () => void;
  onManageQuiz: (lesson: Lesson, question: QuizQuestion | null) => void;
  courseId: string; // Required for Firebase Storage path
  lessonId: string | null; // Required for Firebase Storage path (when editing)
  onAttachmentsUpdated: (updatedLesson: Lesson) => void;
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [contentBlocks, setContentBlocks] = useState<LessonContentBlock[]>(
    initialData?.contentBlocks || []
  );
  // NEW: State for attachments
  const [attachments, setAttachments] = useState<Attachment[]>(
    initialData?.attachments || []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Add a new content block
  const handleAddBlock = (type: "text" | "video") => {
    if (type === "text") {
      setContentBlocks([
        ...contentBlocks,
        { id: generateUniqueId(), type: "text", content: "" },
      ]);
    } else if (type === "video") {
      setContentBlocks([
        ...contentBlocks,
        { id: generateUniqueId(), type: "video", url: "" },
      ]);
    }
  };

  // Update content of a specific block
  const handleBlockChange = (
    id: string,
    field: "content" | "url",
    value: string
  ) => {
    setContentBlocks((prevBlocks) =>
      prevBlocks.map((block) => {
        if (block.id === id) {
          if (block.type === "text" && field === "content") {
            return { ...block, content: value } as TextContentBlock;
          } else if (block.type === "video" && field === "url") {
            return { ...block, url: value } as VideoContentBlock;
          }
        }
        return block;
      })
    );
  };

  // Delete a content block
  const handleDeleteBlock = (id: string) => {
    if (confirm("Tem certeza que deseja remover este bloco de conteúdo?")) {
      setContentBlocks((prevBlocks) =>
        prevBlocks.filter((block) => block.id !== id)
      );
    }
  };

  // Reorder content blocks
  const handleMoveBlock = (id: string, direction: "up" | "down") => {
    const index = contentBlocks.findIndex((block) => block.id === id);
    if (index === -1) return;

    const newBlocks = [...contentBlocks];
    let newIndex = index;

    if (direction === "up" && index > 0) {
      newIndex = index - 1;
    } else if (direction === "down" && index < newBlocks.length - 1) {
      newIndex = index + 1;
    } else {
      return; // Can't move
    }

    const [movedBlock] = newBlocks.splice(index, 1);
    newBlocks.splice(newIndex, 0, movedBlock);
    setContentBlocks(newBlocks);
  };

  // NEW: Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!lessonId) {
      toast.error("Por favor, salve a lição primeiro para adicionar anexos.");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    const attachmentId = generateUniqueId();
    const filePath = `courses/${courseId}/lessons/${lessonId}/attachments/${attachmentId}_${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        toast.error("Falha ao fazer upload do anexo.");
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const newAttachment: Attachment = {
          id: attachmentId,
          name: file.name,
          url: downloadURL,
          type: file.type,
          size: file.size,
        };

        try {
          const lessonDocRef = doc(
            db,
            "courses",
            courseId,
            "sections",
            sectionId,
            "lessons",
            lessonId
          );
          await updateDoc(lessonDocRef, {
            attachments: arrayUnion(newAttachment), // Atomically add to array
          });
          setAttachments((prev) => [...prev, newAttachment]); // Update local state
          // Notify parent component about the change
          const updatedLesson = {
            ...initialData,
            attachments: [...(initialData?.attachments || []), newAttachment],
          } as Lesson;
          onAttachmentsUpdated(updatedLesson);
          toast.success("Anexo enviado com sucesso!");
        } catch (error) {
          console.error("Error updating lesson with attachment:", error);
          toast.error("Erro ao adicionar anexo à lição.");
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      }
    );
  };

  // NEW: Handle attachment deletion
  const handleDeleteAttachment = async (attachmentToDelete: Attachment) => {
    if (
      !lessonId ||
      !confirm(
        `Tem certeza que deseja remover o anexo "${attachmentToDelete.name}"?`
      )
    ) {
      return;
    }

    const toastId = toast.loading("Removendo anexo...");
    try {
      // 1. Delete from Firebase Storage
      const fileRef = ref(storage, attachmentToDelete.url); // Use the URL to get the storage ref
      await deleteObject(fileRef);

      // 2. Delete from Firestore document
      const lessonDocRef = doc(
        db,
        "courses",
        courseId,
        "sections",
        sectionId,
        "lessons",
        lessonId
      );
      await updateDoc(lessonDocRef, {
        attachments: arrayRemove(attachmentToDelete), // Atomically remove from array
      });

      // 3. Update local state
      setAttachments((prev) =>
        prev.filter((att) => att.id !== attachmentToDelete.id)
      );
      // Notify parent component about the change
      const updatedLesson = {
        ...initialData,
        attachments: (initialData?.attachments || []).filter(
          (att) => att.id !== attachmentToDelete.id
        ),
      } as Lesson;
      onAttachmentsUpdated(updatedLesson);
      toast.success("Anexo removido com sucesso!", { id: toastId });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast.error("Falha ao remover anexo.", { id: toastId });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("O título da lição não pode estar vazio.");
      return;
    }

    const isValid = contentBlocks.some((block) => {
      if (block.type === "text" && block.content?.trim() !== "") return true;
      if (block.type === "video" && block.url?.trim() !== "") return true;
      return false;
    });

    if (contentBlocks.length === 0 || !isValid) {
      toast.error(
        "A lição deve ter pelo menos um bloco de conteúdo preenchido (texto ou vídeo)."
      );
      return;
    }

    const lessonData: Omit<Lesson, "id" | "order"> = {
      sectionId: sectionId,
      title,
      contentBlocks: contentBlocks.map((block) => {
        // Ensure content/url is null if empty string for Firestore
        if (block.type === "text") {
          return {
            ...block,
            content: block.content?.trim() !== "" ? block.content : null,
          };
        }
        if (block.type === "video") {
          return { ...block, url: block.url?.trim() !== "" ? block.url : null };
        }
        return block;
      }) as LessonContentBlock[],
      quiz: initialData?.quiz, // Preserve existing quiz data
      // attachments: attachments, // Attachments are handled separately via updateDoc
    };
    onSave(lessonData); // This saves the title and content blocks, not attachments directly
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FluencyInput
        label="Título da Lição"
        id="lessonTitle"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        variant="solid"
      />

      {/* Content Blocks Management */}
      <div className="pt-6 border-t border-fluency-gray-200 dark:border-fluency-gray-700">
        <h3 className="text-lg font-semibold text-fluency-text-light dark:text-fluency-text-dark mb-4">
          Blocos de Conteúdo
        </h3>
        
        <div className="space-y-4">
          {contentBlocks.map((block, index) => (
            <div key={block.id} className="p-4 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-xl shadow-sm">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  {block.type === "text" ? (
                    <FluencyTextarea
                      label="Texto (Markdown)"
                      value={(block as TextContentBlock).content}
                      onChange={(e) => handleBlockChange(block.id, "content", e.target.value)}
                      rows={5}
                      variant="solid"
                      className="font-mono text-sm"
                      placeholder="Adicione seu texto em Markdown aqui."
                    />
                  ) : (
                    <FluencyInput
                      label="URL do Vídeo (Embed)"
                      type="url"
                      value={(block as VideoContentBlock).url}
                      onChange={(e) => handleBlockChange(block.id, "url", e.target.value)}
                      variant="solid"
                      placeholder="Ex: https://www.youtube.com/embed/dQw4w9WgXcQ"
                    />
                  )}
                </div>
                
                <div className="flex flex-col gap-1">
                  <FluencyButton
                    onClick={() => handleMoveBlock(block.id, "up")}
                    disabled={index === 0}
                  >
                    <FiChevronUp className="w-4 h-4" />
                  </FluencyButton>
                  <FluencyButton
                    onClick={() => handleMoveBlock(block.id, "down")}
                    disabled={index === contentBlocks.length - 1}
                  >
                    <FiChevronDown className="w-4 h-4" />
                  </FluencyButton>
                  <FluencyButton
                    onClick={() => handleDeleteBlock(block.id)}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </FluencyButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <FluencyButton
            type="button"
            onClick={() => handleAddBlock("text")}
            variant="solid"
          >
            <FiPlus className="mr-2 w-4 h-4" /> Bloco de Texto
          </FluencyButton>
          <FluencyButton
            type="button"
            onClick={() => handleAddBlock("video")}
            variant="solid"
          >
            <FiPlus className="mr-2 w-4 h-4" /> Bloco de Vídeo
          </FluencyButton>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="pt-6 border-t border-fluency-gray-200 dark:border-fluency-gray-700">
        <h3 className="text-lg font-semibold text-fluency-text-light dark:text-fluency-text-dark mb-4">
          Anexos da Lição
        </h3>

        <div className="space-y-2">
          {attachments.length === 0 ? (
            <p className="text-fluency-text-light dark:text-fluency-text-dark text-sm">
              Nenhum anexo adicionado.
            </p>
          ) : (
            attachments.map((att) => (
              <div key={att.id} className="flex justify-between items-center p-3 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fluency-blue-500 hover:underline flex items-center gap-2"
                >
                  <FiPaperclip className="flex-shrink-0" />
                  <span className="truncate">{att.name}</span>
                  <span className="text-xs opacity-75">({(att.size / 1024).toFixed(1)} KB)</span>
                </a>
                <FluencyButton
                  onClick={() => handleDeleteAttachment(att)}
                >
                  <FiTrash2 className="w-4 h-4" />
                </FluencyButton>
              </div>
            ))
          )}
        </div>

        <div className="mt-6">
          <FluencyUpload
            label="Adicionar novo anexo"
            variant="solid"
            onChange={handleFileUpload}
            disabled={uploading || !lessonId}
            className="w-full"
          />
          
          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-fluency-text-light dark:text-fluency-text-dark">
                <span>Enviando: {uploadProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-fluency-gray-100 dark:bg-fluency-gray-800 rounded-full h-2">
                <div
                  className="bg-fluency-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {!lessonId && (
            <p className="text-fluency-orange-600 dark:text-fluency-orange-400 text-sm mt-2">
              * Para adicionar anexos, salve a lição primeiro.
            </p>
          )}
        </div>
      </div>

      {/* Quiz Section */}
      {initialData && (
        <div className="pt-6 border-t border-fluency-gray-200 dark:border-fluency-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-fluency-text-light dark:text-fluency-text-dark mb-1">
                Quiz da Lição
              </h3>
              <p className="text-sm text-fluency-text-light dark:text-fluency-text-dark">
                {initialData.quiz?.length || 0} questão(ões) adicionada(s)
              </p>
            </div>
            <FluencyButton
              type="button"
              onClick={() => onManageQuiz(initialData, null)}
              variant="solid"
            >
              <FiHelpCircle className="mr-2 w-4 h-4" /> Gerenciar Quiz
            </FluencyButton>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="pt-6 border-t border-fluency-gray-200 dark:border-fluency-gray-700 flex flex-col-reverse sm:flex-row justify-end gap-3">
        <FluencyButton
          type="button"
          onClick={onCancel}
          variant="gray"
          className="w-full sm:w-auto"
        >
          Cancelar
        </FluencyButton>
        <FluencyButton
          type="submit"
          variant="confirm"
          className="w-full sm:w-auto"
        >
          Salvar Lição
        </FluencyButton>
      </div>
    </form>
  );
};

export default LessonForm;