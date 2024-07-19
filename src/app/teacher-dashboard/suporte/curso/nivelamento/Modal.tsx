import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import React, { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 z-[9999] p-8 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-white p-4 m-8 rounded-lg shadow-lg relative'>
                <FluencyCloseButton className='absolute top-0 right-0' onClick={onClose}/>
                {children}
            </div>
        </div>
    );
};

export default Modal;
