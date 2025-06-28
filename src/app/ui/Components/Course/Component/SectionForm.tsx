import { useState } from "react";
import toast from "react-hot-toast";
import { Section } from "../types";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";

const SectionForm = ({ 
  initialData, 
  onSave, 
  onCancel 
}: { 
  initialData: Section | null; 
  onSave: (data: { title: string }) => void; 
  onCancel: () => void 
}) => {
  const [title, setTitle] = useState(initialData?.title || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("O título da seção não pode estar vazio.");
      return;
    }
    onSave({ title });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FluencyInput
        label="Título da Seção"
        id="sectionTitle"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        variant="solid"
        placeholder="Introdução ao Curso"
      />

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
          Salvar Seção
        </FluencyButton>
      </div>
    </form>
  );
};

export default SectionForm;