import { db } from "@/app/firebase";
import { updateDoc, doc } from "firebase/firestore";
import { useState } from "react";
import toast from "react-hot-toast";
import FluencyButton from "../../Components/Button/button";
import FluencyInput from "../../Components/Input/input";
import { VscWholeWord } from "react-icons/vsc";

export default function DescriptionChange() {
  const params = new URLSearchParams(window.location.search);
  const studentID = params.get("student") || "";
  const notebookID = params.get("notebook") || "";

  const [openDescription, setOpenDescription] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewDescription(event.target.value);
  };

  const handleUpdateDescription = async () => {
    try {
      await updateDoc(doc(db, `users/${studentID}/Notebooks/${notebookID}`), {
        description: newDescription,
      });
      setDescription(newDescription);
      toast.success("Descrição atualizada!", {
        position: "top-center",
      });
      setOpenDescription(false);
    } catch (error) {
      console.error("Error updating description: ", error);
      toast.error("Erro ao atualizar descrição!", {
        position: "top-center",
      });
      setOpenDescription(false);
    }
  };

  return (
    <div className="bg-gray-200 dark:bg-gray-950 p-2 px-3 rounded-md flex flex-col items-center justify-start gap-2">
      <div
        className="flex flex-row items-center gap-2 font-bold text-black dark:text-white dark:hover:text-indigo-700 hover:text-indigo-700 duration-300 ease-in-out transition-all cursor-pointer"
        onClick={() => setOpenDescription(!openDescription)}
      >
        <p>{openDescription ? "Atualizar" : "Descrição"}</p>
        <VscWholeWord className='text-xl'/>
      </div>
      <div
        className={`transition-max-height duration-500 ease-in-out overflow-hidden w-full ${
          openDescription ? "max-h-[300px]" : "max-h-0"
        }`}
      >
        <div className="px-1 py-2">
          <div className="mt-2 flex flex-col gap-2 w-full">
            <FluencyInput
              className="w-full"
              defaultValue={description}
              placeholder="Descrição da aula"
              onChange={handleDescriptionChange}
            />
            <FluencyButton variant="purple" onClick={handleUpdateDescription} className="w-full">
              Salvar
            </FluencyButton>
          </div>
        </div>
      </div>
    </div>
  );
}
