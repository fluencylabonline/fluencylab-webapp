import FluencyCloseButton from "../../ModalComponents/closeModal";

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-fluency-gray-200 dark:border-fluency-gray-700">
          <h2 className="text-xl font-semibold text-fluency-text-light dark:text-fluency-text-dark">
            {title}
          </h2>
          <FluencyCloseButton onClick={onClose}/>
        </div>
        <div className="overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;