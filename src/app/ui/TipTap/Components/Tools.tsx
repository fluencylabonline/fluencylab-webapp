'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Modals
import { Editor } from '@tiptap/react';
import Workbooks from './Workbooks';
import DescriptionChange from './DescriptionChange';
import VersionsModal from './VersionsModal';

// Icons
import { IoClose, IoCloudDownloadOutline } from 'react-icons/io5';
import { PiChalkboardTeacher, PiNotebookBold, PiStudentFill } from 'react-icons/pi';
import { MdOutlineTipsAndUpdates } from 'react-icons/md';
import { AiFillYoutube } from 'react-icons/ai';
import { FiTool } from 'react-icons/fi';
import { FaHistory, FaRegImage, FaTasks } from 'react-icons/fa';
import { BsTranslate } from 'react-icons/bs';
import { CgTranscript } from 'react-icons/cg';
import { GiChoice } from 'react-icons/gi';
import { LuFileText, LuBookOpen, LuFileAudio } from 'react-icons/lu';
import { GoGoal } from 'react-icons/go';
import { TbReload, TbVocabulary } from 'react-icons/tb';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

//ExtensionsTipTap
import TextStudentModal from './Extensions/TextStudent/TextStudentModal';
import TextTeacherModal from './Extensions/TextTeacher/TextTeacherModal';
import TextTipModal from './Extensions/TextTip/TextTipModal';
import BandImageModal from './Extensions/BandImage/BandImageModal';
import BandVideo from './Extensions/BandVideo/BandVideoModal';
import Sentences from './Extensions/Sentences/SentencesModal';
import Translation from './Extensions/Translation/TranslationModal';
import MultipleChoiceModal from './Extensions/MultipleChoice/MultipleChoiceModal';
import Question from './Extensions/Question/QuestionsModal';
import Audio from './Extensions/Audio/AudioModal';
import Pronounce from './Extensions/Pronounce/PronounceModal';
import Review from './Extensions/Review/ReviewModal';
import Goal from './Extensions/Goal/GoalModal';
import Vocabulab from './Extensions/Vocabulab/VocabulabModal';
import Download from './Extensions/Download/DownloadModal';
import StudentTasks from './StudentTasks';
import FlashcardModal from './Extensions/Flashcards/FlashcardModal'

interface ToolsProps {
  editor: Editor;
}

const Tools: React.FC<ToolsProps> = ({ editor }) => {
  const [modals, setModals] = useState({
    textStudent: false,
    textTeacher: false,
    textTip: false,
    bandImage: false,
    bandVideo: false,

    sentences: false,
    translation: false,
    choice: false,
    question: false,
    audio: false,
    pronounce: false,

    review: false,
    goal: false,
    vocabulab: false,
    download: false,
    flashcard: false,

    workbooksList: false,
    versions: false,
    description: false,

    tasks: false,
  });

  const toggleModal = (modalName: keyof typeof modals, state: boolean) => {
    setModals((prev) => ({ ...prev, [modalName]: state }));
    closeBottomSheet();
    setOpenDescription(null);
  };

  const [isAnimating, setAnimating] = useState(false);
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
  const openBottomSheet = () => setBottomSheetOpen(true);
  const closeBottomSheet = () => {
    setAnimating(true);
    setTimeout(() => {
      setBottomSheetOpen(false);
      setAnimating(false);
    }, 200);
    setOpenDescription(null);
  };

  const toggleBottomSheet = () => {
    setBottomSheetOpen(!isBottomSheetOpen);
  };

  const bottomSheetVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { y: '100%', opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  const [openDescription, setOpenDescription] = useState<string | null>(null);
  const handleItemClick = (label: string) => {
    if (openDescription === label) {
      setOpenDescription(null);
    } else {
      setOpenDescription(label);
    }
  };

  //BANDS MODALS
  const bandButtons = [
    { label: 'Professor', icon: <PiChalkboardTeacher className='text-blue-900 text-xl' />, modal: 'textTeacher', description: 'Uma faixa com uma instrução para o professor' },
    { label: 'Aluno', icon: <PiStudentFill className='text-blue-900 text-xl' />, modal: 'textStudent', description: 'Uma faixa com uma instrução para o aluno' },
    { label: 'Dica', icon: <MdOutlineTipsAndUpdates className='text-yellow-500 text-xl' />, modal: 'textTip', description: 'Uma faixa com uma dica para o aluno' },
    { label: 'Imagem', icon: <FaRegImage className='text-orange-500 text-xl' />, modal: 'bandImage', description: 'Uma faixa com uma imagem e texto opcional' },
    { label: 'Vídeo', icon: <AiFillYoutube className='text-red-600 text-xl' />, modal: 'bandVideo', description: 'Um vídeo do Youtube ou Google Drive' },
  ];

  const bands = () =>
    bandButtons.map((tool) => (
      <div className='w-full' key={tool.label}>
        <button
          className="bg-gray-200 dark:bg-gray-950 p-2 px-3 rounded-md flex flex-col items-center justify-start gap-2 w-full"
        >
          <div className="flex flex-row items-center gap-2 font-bold text-black dark:text-white dark:hover:text-fluency-orange-500 hover:text-fluency-orange-600 duration-300 ease-in-out transition-all cursor-pointer">
            <p onClick={() => toggleModal(tool.modal as keyof typeof modals, true)}>{tool.label}</p>
            {openDescription === tool.label ? 
            (<IoIosArrowUp onClick={() => handleItemClick(tool.label)} />):
            (<IoIosArrowDown onClick={() => handleItemClick(tool.label)} />)}
          </div>
          <div
            className={`transition-all duration-300 ease-in-out transform ${
              openDescription === tool.label ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            {openDescription === tool.label && (
              <div className="bg-gray-200 dark:bg-gray-950 p-4 rounded-md w-full">
                <p className="flex flex-col gap-2 items-center text-sm text-gray-600 dark:text-gray-300">{tool.icon}{tool.description}</p>
              </div>
            )}
          </div>
        </button>
      </div>
    ));

  //EXERCISE MODALS
  const exercisesButtons = [
    { label: 'Frases', icon: <LuFileText className='text-xl'/>, modal: 'sentences', description: 'O aluno precisará fazer frases baseadas na frase ou texto que fornecer' },
    { label: 'Tradução', icon: <BsTranslate className='text-xl'/>, modal: 'translation', description: 'O aluno deverá fornecer traduções para as frases' },
    { label: 'Escolha', icon: <GiChoice className='text-xl'/>, modal: 'choice', description: 'Atividade de múltipla escolha' },
    { label: 'Exercício', icon: <LuBookOpen className='text-xl'/>, modal: 'question', description: 'Um exercício que o aluno precisa completar o que falta' },
    { label: 'Áudio', icon: <LuFileAudio className='text-xl'/>, modal: 'audio', description: 'Áudio para treinar o ouvido' },
    { label: 'Pronúncia', icon: <CgTranscript className='text-xl'/>, modal: 'pronounce', description: 'Um texto para treinar a pronúncia' },
    { label: 'Flashcards', icon: <LuBookOpen className='text-xl'/>, modal: 'flashcard', description: 'Add interactive flashcards' },
  ];

  const exercises = () =>
    exercisesButtons.map((tool) => (
      <div className='w-full' key={tool.label}>
        <button
          className="bg-gray-200 dark:bg-gray-950 p-2 px-3 rounded-md flex flex-col items-center justify-start gap-2 w-full"
        >
          <div className="flex flex-row items-center gap-2 font-bold text-black dark:text-white dark:hover:text-fluency-green-500 hover:text-fluency-green-500 duration-300 ease-in-out transition-all cursor-pointer">
            <p onClick={() => toggleModal(tool.modal as keyof typeof modals, true)}>{tool.label}</p>
            {openDescription === tool.label ? 
            (<IoIosArrowUp onClick={() => handleItemClick(tool.label)} />):
            (<IoIosArrowDown onClick={() => handleItemClick(tool.label)} />)}
          </div>
          <div
            className={`transition-all duration-300 ease-in-out transform ${
              openDescription === tool.label ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            {openDescription === tool.label && (
              <div className="bg-gray-200 dark:bg-gray-950 p-4 rounded-md w-full">
                <p className="flex flex-col gap-2 items-center text-sm text-gray-600 dark:text-gray-300">{tool.icon}{tool.description}</p>
              </div>
            )}
          </div>
        </button>
      </div>
    ));

  //OTHER MODALS
  const otherButtons = [
    { label: 'Revisão', icon: <TbReload className='text-xl'/>, modal: 'review', description: 'Coloque aqui a revisão da aula' },
    { label: 'Meta', icon: <GoGoal className='text-xl'/>, modal: 'goal', description: 'Metas para o aluno durante a semana que deve ser separado por dia como no modelo' },
    { label: 'Vocabulab', icon: <TbVocabulary className='text-xl'/>, modal: 'vocabulab', description: 'Página específica para treinar o vocabulário de cada aula' },
    { label: 'Arquivo', icon: <IoCloudDownloadOutline  className='text-xl'/>, modal: 'download', description: 'Coloque um arquivo com download fácil aqui' },
  ];

  const others = () =>
    otherButtons.map((tool) => (
      <div className='w-full' key={tool.label}>
        <button
          className="bg-gray-200 dark:bg-gray-950 p-2 px-3 rounded-md flex flex-col items-center justify-start gap-2 w-full"
        >
          <div className="flex flex-row items-center gap-2 font-bold text-black dark:text-white dark:hover:text-fluency-blue-500 hover:text-fluency-blue-500 duration-300 ease-in-out transition-all cursor-pointer">
            <p onClick={() => toggleModal(tool.modal as keyof typeof modals, true)}>{tool.label}</p>
            {openDescription === tool.label ? 
            (<IoIosArrowUp onClick={() => handleItemClick(tool.label)} />):
            (<IoIosArrowDown onClick={() => handleItemClick(tool.label)} />)}
          </div>
          <div
            className={`transition-all duration-300 ease-in-out transform ${
              openDescription === tool.label ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            {openDescription === tool.label && (
              <div className="bg-gray-200 dark:bg-gray-950 p-4 rounded-md w-full">
                <p className="flex flex-col gap-2 items-center text-sm text-gray-600 dark:text-gray-300">{tool.icon}{tool.description}</p>
              </div>
            )}
          </div>
        </button>
      </div>
    ));

  //WORKBOOKS MODALS
  const workbooksButtons = [
    { label: 'Apostilas', icon: <PiNotebookBold className='text-xl'/>, modal: 'workbooksList', description: 'Apostilas disponíveis para usar em aula' },
    { label: 'Histórico', icon: <FaHistory className='text-xl'/>, modal: 'versions', description: 'Histórico das modificações feitas neste documento' },
    { label: 'Tarefas', icon: <FaTasks className='text-xl'/>, modal: 'tasks', description: 'Adicionar tarefas para o aluno' },
  ];

  const workbooksItems = () =>
    workbooksButtons.map((tool) => (
      <div className='w-full' key={tool.label}>
        <button
          className="bg-gray-200 dark:bg-gray-950 p-2 px-3 rounded-md flex flex-col items-center justify-start gap-2 w-full"
        >
          <div className="flex flex-row items-center gap-2 font-bold text-black dark:text-white dark:hover:text-indigo-700 hover:text-indigo-700 duration-300 ease-in-out transition-all cursor-pointer">
            <p onClick={() => toggleModal(tool.modal as keyof typeof modals, true)}>{tool.label}</p>
            {openDescription === tool.label ? 
            (<IoIosArrowUp onClick={() => handleItemClick(tool.label)} />):
            (<IoIosArrowDown onClick={() => handleItemClick(tool.label)} />)}
          </div>
          <div
            className={`transition-all duration-300 ease-in-out transform ${
              openDescription === tool.label ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            {openDescription === tool.label && (
              <div className="bg-gray-200 dark:bg-gray-950 p-4 rounded-md w-full">
                <p className="flex flex-col gap-2 items-center text-sm text-gray-600 dark:text-gray-300">{tool.icon}{tool.description}</p>
              </div>
            )}
          </div>
        </button>
      </div>
    ));

  return (
    <div>
      {/* Modals */}
      <TextStudentModal isOpen={modals.textStudent} onClose={() => toggleModal('textStudent', false)} initialText="" editor={editor} />
      <TextTeacherModal isOpen={modals.textTeacher} onClose={() => toggleModal('textTeacher', false)} initialText="" editor={editor} />
      <TextTipModal isOpen={modals.textTip} onClose={() => toggleModal('textTip', false)} initialText="" editor={editor} />
      <BandImageModal isOpen={modals.bandImage} onClose={() => toggleModal('bandImage', false)} editor={editor} />
      <BandVideo isOpen={modals.bandVideo} onClose={() => toggleModal('bandVideo', false)} editor={editor} />
      <Sentences isOpen={modals.sentences} onClose={() => toggleModal('sentences', false)} editor={editor} />
      <Translation isOpen={modals.translation} onClose={() => toggleModal('translation', false)} editor={editor} />
      <MultipleChoiceModal isOpen={modals.choice} onClose={() => toggleModal('choice', false)} editor={editor} />
      <Question isOpen={modals.question} onClose={() => toggleModal('question', false)} editor={editor} />
      <Audio isOpen={modals.audio} onClose={() => toggleModal('audio', false)} editor={editor} />
      <Pronounce isOpen={modals.pronounce} onClose={() => toggleModal('pronounce', false)} editor={editor} />
      <Review isOpen={modals.review} onClose={() => toggleModal('review', false)} editor={editor} />
      <Goal isOpen={modals.goal} onClose={() => toggleModal('goal', false)} editor={editor} />
      <Vocabulab isOpen={modals.vocabulab} onClose={() => toggleModal('vocabulab', false)} editor={editor} />
      <Download isOpen={modals.download} onClose={() => toggleModal('download', false)} editor={editor} />
      <Workbooks editor={editor} isOpen={modals.workbooksList} onClose={() => toggleModal('workbooksList', false)} />
      <VersionsModal editor={editor} isOpen={modals.versions} onClose={() => toggleModal('versions', false)} />
      <StudentTasks isOpen={modals.tasks} onClose={() => toggleModal('tasks', false)} />
      <FlashcardModal 
        isOpen={modals.flashcard} 
        onClose={() => toggleModal('flashcard', false)} 
        editor={editor} 
      />
      
      {/* Mobile Bottom Sheet */}
      <div
        onClick={toggleBottomSheet}
        className="fixed bottom-16 right-5 bg-fluency-pages-light dark:bg-fluency-pages-dark p-2 rounded-full"
      >
        <FiTool className="w-6 h-6 text-black dark:text-white hover:text-fluency-blue-500 dark:hover:text-fluency-blue-500 transition-all cursor-pointer" />
      </div>

     <AnimatePresence>
        {isBottomSheetOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={toggleBottomSheet}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 w-full max-w-[100vw] min-h-[85vh] max-h-[95vh] overflow-y-auto rounded-t-2xl p-4 shadow-lg"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={bottomSheetVariants}
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex justify-center items-center mb-4">
                <h1 className="text-2xl font-bold">Ferramentas</h1>
                <IoClose onClick={closeBottomSheet} className="icon cursor-pointer absolute top-0 right-4 mt-2 ml-2 transition-all text-gray-500 hover:text-blue-600 w-7 h-7 ease-in-out duration-300" />
            </div>
            <div className='flex flex-row items-start justify-center flex-wrap gap-2'>
              <div className="min-w-[20%] flex flex-col items-center gap-1 bg-gray-300 dark:bg-gray-900 rounded-md p-2 pb-4 px-6">
                <h1 className="text-xl font-bold text-fluency-orange-500">Faixas</h1>
                {bands()}
              </div>
              <div className="min-w-[20%] flex flex-col items-center gap-1 bg-gray-300 dark:bg-gray-900 rounded-md p-2 pb-4 px-6">
                <h1 className="text-xl font-bold text-fluency-blue-500">Recursos</h1>
                {others()}
              </div>
              <div className="min-w-[20%] flex flex-col items-center gap-1 bg-gray-300 dark:bg-gray-900 rounded-md p-2 pb-4 px-6">
                <h1 className="text-xl font-bold text-fluency-green-500">Exercícios</h1>
                {exercises()}
              </div>
              <div className="min-w-[20%] flex flex-col items-center gap-1 bg-gray-300 dark:bg-gray-900 rounded-md p-2 pb-4 px-6">
                <h1 className="text-xl font-bold text-indigo-700">Apostila</h1>
                {workbooksItems()}
                <DescriptionChange />
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tools;
