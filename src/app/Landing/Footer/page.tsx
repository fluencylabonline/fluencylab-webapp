'use client';
import { useState } from 'react';
import Image from "next/image"

//Image
import Logo from '../../../../public/images/brand/logo.png';

//Icons
import { IoClose } from "react-icons/io5";
import { IoLogoWhatsapp } from "react-icons/io5";
import { FaThreads } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";

import { SocialIcon } from 'react-social-icons'

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 ${isOpen ? 'flex' : 'hidden'}`}>
        <div className="bg-fluency-bg-light rounded-lg shadow-lg p-4 h-max w-max flex flex-row items-start">
        <button
          onClick={onClose}
          className="relative -top-2 -left-2 text-fluency-blue-800">
          <span className="sr-only">Fechar</span>
          <IoClose className='w-7 h-7 hover:text-fluency-blue-500 ease-in-out duration-300' />
        </button>

          <div className="p-2 text-fluency-blue-800">
            <div className="text-lg font-bold mb-3">Nossos contatos</div>
            <div>Email: fluencylab.online@gmail.com</div>
            <div>Telefone: (86) 9 9953-5791</div>
          </div>
        </div>
    </div>
  );
};


function Footer(){
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

    return (
    <footer className="px-4 divide-y bg-fluency-bg-light dark:bg-fluency-pages-dark relative bottom-2 mr-3 ml-3 rounded-xl">
      <div className="container flex flex-col justify-between py-10 mx-auto space-y-8 lg:flex-row lg:space-y-0">
        <div className="lg:w-1/3">
          <a rel="noopener noreferrer" href="#" className="flex justify-center space-x-3 lg:justify-start">
            <div className="flex items-center justify-center w-60">
            <Image
                className="h-auto w-auto hover:contrast-150 ease-in-out duration-300"
                src={Logo}
                alt="FluencyLab"
              />
            </div>
          </a>
        </div>
        <div className="grid grid-cols-2 text-sm gap-x-3 gap-y-8 lg:w-2/3 sm:grid-cols-4 justify-items-center">
          
              <div className="space-y-3">
                <h3 className="tracking-wide uppercase dark:text-gray-50 font-bold">Para alunos</h3>
                <ul className="space-y-1 text-fluency-gray-400 dark:text-fluency-gray-200">
                  <li className='hover:text-fluency-gray-500 hover:dark:text-fluency-gray-300 ease-in-out duration-300'>
                    <a rel="noopener noreferrer" href="/u/validation">Validar certificado</a>
                  </li>
                  <li className='hover:text-fluency-gray-500 hover:dark:text-fluency-gray-300 ease-in-out duration-300'>
                    <a rel="noopener noreferrer" href="#">Remarcações</a>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="tracking-wide uppercase dark:text-gray-50 font-bold">Empresa</h3>
                <ul className="space-y-1 text-fluency-gray-400 dark:text-fluency-gray-200">
                  <li className='hover:text-fluency-gray-500 hover:dark:text-fluency-gray-300 ease-in-out duration-300'>
                    <a rel="noopener noreferrer" href="#" onClick={openModal}>Fale conosco</a>
                  </li>
                  <li className='hover:text-fluency-gray-500 hover:dark:text-fluency-gray-300 ease-in-out duration-300'>
                    <a rel="noopener noreferrer" href="/u/privacy">Privacidade</a>
                  </li>
                  <li className='hover:text-fluency-gray-500 hover:dark:text-fluency-gray-300 ease-in-out duration-300'>
                    <a rel="noopener noreferrer" href="/u/termsandpolicies">Termos de Serviço</a>
                  </li>
                  
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="tracking-wide uppercase w-full text-left dark:text-gray-50 font-bold">Informe um problema</h3>
                <ul className="space-y-1 text-fluency-gray-400 dark:text-fluency-gray-200">
                  <li className='hover:text-fluency-gray-500 hover:dark:text-fluency-gray-300 ease-in-out duration-300'>
                    <a onClick={openModal} rel="noopener noreferrer" href="#">Contato</a>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 flex flex-col items-center font-bold">
                <div className="uppercase dark:text-gray-50">Redes Sociais</div>
                  <div className="flex justify-center gap-2">
                      <SocialIcon style={{ width: '40px', height: '40px' }} url="https://api.whatsapp.com/send/?phone=5549999535791" />
                      <SocialIcon style={{ width: '40px', height: '40px' }} url="https://www.threads.net/@fluency.lab" />
                      <SocialIcon style={{ width: '40px', height: '40px' }} url="https://www.instagram.com/fluency.lab/" />
                  </div>
              </div>

        </div>
      </div>
      <div className="py-6 text-sm text-center dark:text-gray-400">© 2024 FluencyLab. Todos os direitos reservados.</div>
      <Modal isOpen={isModalOpen} onClose={closeModal} />
    </footer>
    );
  };

export default Footer;







  