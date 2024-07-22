import { useState } from "react";

//Icons
import { IoClose } from "react-icons/io5";
import { GrSend } from "react-icons/gr";

//Notification
import toast, { Toaster } from 'react-hot-toast';
  
interface WhatsAppButtonProps {
    buttonText: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ buttonText }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const saveSettings = (settings: any): Promise<void> => {
        // Assuming you have some asynchronous operation here to save the settings
        return new Promise<void>((resolve, reject) => {
          // Simulating a successful save after a delay
          setTimeout(() => {
            // Resolve the promise to indicate success
            resolve();
          }, 1000); // Simulated delay of 1 second
        });
      };
      
    const openModal = () => {
      setModalOpen(true);
    };
  
    const closeModal = () => {
      setModalOpen(false);
      setName('');
      setEmail('');
      setSelectedLanguage('');
    };
  
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
    };
  
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    };
  
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedLanguage(e.target.value);
    };
  
    const handleSubmit = () => {
        if (!name || !email || !selectedLanguage) {
          // Display toast message for form validation failure
          toast.error("Por favor, preencha todos os campos.",);
          return;
        }
      
        const whatsappMessage = `Olá, Eu sou ${name}. Eu quero aprender ${selectedLanguage}. Meu e-mail é: ${email}. Quero marcar uma aula teste!`;
        const whatsappLink = `https://wa.me/5586999535791?text=${encodeURIComponent(whatsappMessage)}`;
      
        // Display toast message while asynchronously handling form submission
        toast.promise(
          saveSettings({ name, email, selectedLanguage }), // Pass settings object to saveSettings function
          {
            loading: 'Um momento...',
            success: <b>Vamos lá!</b>,
            error: <b>Ops! Algo deu errado.</b>,
          }
        ).then(() => {
          // Open WhatsApp link after the form submission is successful
          window.open(whatsappLink, '_blank');
          closeModal();
        }).catch(() => {
          // Handle errors, if any
          console.error('Error occurred while saving settings');
        });
      };      
      
  
    return (
      <div>
        <button
          onClick={openModal}
          className="w-max cursor-pointer gap-1 leading-6 inline-flex items-center px-3 py-2 bg-fluency-green-500 hover:bg-fluency-green-600 ease-in-out duration-300 text-fluency-text-dark text-sm font-medium rounded-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            strokeWidth={0.1}
            stroke="currentColor"
            fill="white"
            className="w-6 h-6"
            viewBox="0 0 24 24"
          >
            <path d="M 12 2 C 6.5 2 2 6.5 2 12 C 2 13.8 2.5007813 15.5 3.3007812 17 L 2 22 L 7.1992188 20.800781 C 8.6992188 21.600781 10.3 22 12 22 C 17.5 22 22 17.5 22 12 C 22 9.3 20.999609 6.8003906 19.099609 4.9003906 C 17.199609 3.0003906 14.7 2 12 2 z M 12 4 C 14.1 4 16.099219 4.8007813 17.699219 6.3007812 C 19.199219 7.9007813 20 9.9 20 12 C 20 16.4 16.4 20 12 20 C 10.7 20 9.2992187 19.7 8.1992188 19 L 7.5 18.599609 L 6.8007812 18.800781 L 4.8007812 19.300781 L 5.3007812 17.5 L 5.5 16.699219 L 5.0996094 16 C 4.3996094 14.8 4 13.4 4 12 C 4 7.6 7.6 4 12 4 z M 8.5 7.4003906 C 8.3 7.4003906 8.0007812 7.3992188 7.8007812 7.6992188 C 7.5007813 7.9992188 6.9003906 8.6007813 6.9003906 9.8007812 C 6.9003906 11.000781 7.8003906 12.200391 7.9003906 12.400391 C 8.1003906 12.600391 9.6992188 15.199219 12.199219 16.199219 C 14.299219 16.999219 14.699219 16.800781 15.199219 16.800781 C 15.699219 16.700781 16.700391 16.199609 16.900391 15.599609 C 17.100391 14.999609 17.099219 14.499219 17.199219 14.199219 C 17.099219 14.099219 16.999219 14.000391 16.699219 13.900391 C 16.499219 13.800391 15.3 13.199609 15 13.099609 C 14.7 12.999609 14.600391 12.899219 14.400391 13.199219 C 14.200391 13.499219 13.699609 13.999219 13.599609 14.199219 C 13.499609 14.399219 13.399609 14.400781 13.099609 14.300781 C 12.899609 14.200781 12.099609 13.999609 11.099609 13.099609 C 10.299609 12.499609 9.7992187 11.700391 9.6992188 11.400391 C 9.4992187 11.200391 9.7007813 11.000391 9.8007812 10.900391 L 10.199219 10.5 C 10.299219 10.4 10.300391 10.199609 10.400391 10.099609 C 10.500391 9.9996094 10.500391 9.8992188 10.400391 9.6992188 C 10.300391 9.4992187 9.7996094 8.3007812 9.5996094 7.8007812 C 9.3996094 7.4007812 9.2 7.4003906 9 7.4003906 L 8.5 7.4003906 z"></path>
          </svg>
          <span>{buttonText}</span> 
        </button>

        <Toaster />

        {modalOpen && (
          <div className="fixed z-100 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-fluency-gray-400 opacity-95"></div>
              </div>
              <div className="bg-fluency-text-dark text-black dark:text-white dark:bg-fluency-pages-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-max h-max p-5">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left p-4">
                    <button
                      onClick={closeModal}
                      className="absolute top-0 left-0 mt-2 ml-2 text-fluency-gray-500 hover:text-fluency-gray-700"
                    >
                      <span className="sr-only">Fechar</span>
                      <IoClose className="w-7 h-7 hover:text-fluency-green-600 ease-in-out duration-300" />
                    </button>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-2">
                      Fala com a gente!
                    </h3>
                    <div className="mt-2 flex flex-col">
                      <input
                        type="text"
                        placeholder="Seu nome"
                        value={name}
                        onChange={handleNameChange}
                        className="border rounded-md px-3 py-2 w-full mb-2 dark:bg-fluency-pages-dark"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Seu e-mail"
                        value={email}
                        onChange={handleEmailChange}
                        className="border rounded-md px-3 py-2 w-full mb-2 dark:bg-fluency-pages-dark"
                        required
                      />
                      <select
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                        className="border rounded-md px-3 py-2 w-full mb-2 dark:bg-fluency-pages-dark"
                        required
                      >
                        <option value="">Selecione o idioma</option>
                        <option value="Espanhol">Espanhol</option>
                        <option value="Inglês">Inglês</option>
                        <option value="Libras">Libras</option>
                      </select>
                      <button
                        onClick={handleSubmit}
                        className="flex flex-row gap-1 leading-6 justify-center mt-3 items-center px-3 py-2 bg-fluency-green-500 hover:bg-fluency-green-600 ease-in-out duration-300 text-fluency-text-dark text-md font-medium rounded-md">
                        <GrSend /> Abrir WhatsApp Web
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };