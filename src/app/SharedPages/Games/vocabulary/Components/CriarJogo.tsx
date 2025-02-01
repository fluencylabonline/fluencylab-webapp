'use client';
import { useState } from "react";
import { storage, db } from "@/app/firebase"; // Firebase storage and Firestore
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";

// Imports
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";

import toast from "react-hot-toast";

// Icons
import { IoClose } from "react-icons/io5";
import { MdDelete } from "react-icons/md";

export default function CriarJogo() {
    const [vocabList, setVocabList] = useState<{ vocab: string; imageURL: string }[]>([]);
    const [setName, setSetName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageURL, setCurrentImageURL] = useState<string | null>(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleAddVocab = (vocab: string, imageURL: string) => {
        if (vocab && imageURL) {
            setVocabList((prev) => [...prev, { vocab, imageURL }]);
            toast.success('Vocábulo adicionado!');
            setCurrentImageURL(null); // Reset current image URL
        } else {
            toast.error('Por favor, insira o vocábulo e carregue a imagem.');
        }
    };

    const handleRemoveVocab = (index: number) => {
        setVocabList((prev) => prev.filter((_, i) => i !== index));
    };

    const handleFileUpload = async (file: File): Promise<void> => {
        const storageRef = ref(storage, `vocabularyGameImages/${file.name}`);
        const imageURL = await toast.promise(
            uploadBytes(storageRef, file)
                .then(async () => {
                    const url = await getDownloadURL(storageRef);
                    return url; // Return the URL for the uploaded file
                }),
            {
                loading: 'Carregando imagem...',
                success: 'Imagem carregada com sucesso!',
                error: 'Erro ao carregar imagem. Tente novamente.',
            }
        );

        setCurrentImageURL(imageURL); // Set the current image URL for the next step
    };

    const handleSaveSet = async () => {
        if (!setName) {
            toast.error('Por favor, insira o nome do conjunto.');
            return;
        }
    
        if (vocabList.length < 8) {
            toast.error('Por favor, adicione pelo menos 8 vocábulos.');
            return;
        }
    
        const setId = Math.random().toString(36).substr(2, 9); // Generate a unique ID for the set
        const setRef = doc(db, 'VocabularyGame', setId); // Save directly under the 'sets' collection
    
        try {
            // Save set details
            await setDoc(setRef, {
                name: setName,
                vocabularies: vocabList,
                createdAt: new Date().toISOString(), // Optional: add metadata
            });
    
            toast.success('Conjunto salvo com sucesso!');
            setSetName('');
            setVocabList([]);
            closeModal();
        } catch (error) {
            console.error('Erro ao salvar o conjunto:', error);
            toast.error('Erro ao salvar o conjunto. Tente novamente.');
        }
    };
    
    return (
        <div>
            <FluencyButton variant="gray" className="!w-full" onClick={openModal}>
                Criar um novo jogo
            </FluencyButton>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-end z-50">
                    <div className="flex flex-col items-center justify-start bg-fluency-bg-light dark:bg-fluency-bg-dark w-full max-w-[80vw] min-h-[95vh] max-h-[100vh] rounded-t-2xl p-8 overflow-y-auto shadow-lg transform transition-transform duration-300 ease-in-out">
                        <div className="flex justify-center items-center mb-4">
                            <h1 className="text-xl font-bold">Criar novo jogo</h1>
                            <IoClose
                                onClick={closeModal}
                                className="icon cursor-pointer absolute top-0 right-4 mt-2 ml-2 transition-all text-gray-500 hover:text-blue-600 w-7 h-7 ease-in-out duration-300"
                            />
                        </div>
                        <p className="p-4">Para fazer isso, insira uma ou duas palavras para cada imagem. Lembre de colocar uma imagem que ajude a identificar a palavra. Depois de adicionar a imagem, apenas dê o nome e aperte enter.</p>
                        <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-start lg:justify-around md:justify-around justify-start gap-4 w-full">
                            <div className="flex flex-col items-center gap-2 w-full">
                                <input
                                    type="file"
                                    id="file"
                                    className="sr-only"
                                    onChange={async (e) => {
                                        if (e.target.files?.[0]) {
                                            await handleFileUpload(e.target.files[0]);
                                        }
                                    }}
                                />
                                <label
                                    htmlFor="file"
                                    className="bg-fluency-pages-light dark:bg-fluency-pages-dark relative flex min-h-[200px] items-center justify-center border border-dashed border-[#e0e0e0] p-12 rounded-md text-center"
                                >
                                    <div>
                                        <span className="mb-2 block text-xl font-semibold text-black dark:text-white">
                                            {"Arraste aqui"}
                                        </span>
                                        <span className="mb-2 block text-base font-medium text-[#6B7280]">Ou</span>
                                        <span className="bg-fluency-bg-light dark:bg-fluency-bg-dark inline-flex rounded border py-2 px-7 text-base font-medium dark:text-white text-black">
                                            Procurar
                                        </span>
                                    </div>
                                </label>
                            </div>

                            <div className="flex flex-col items-stretch justify-center gap-2 w-full">
                                <div className="flex flex-col items-start gap-1">
                                    <p className="font-bold">Nome do conjunto</p>
                                    <FluencyInput
                                        value={setName}
                                        placeholder="Nome do conjunto"
                                        onChange={(e) => setSetName(e.target.value)}
                                    />
                                </div>
                                {currentImageURL && (
                                <div className="flex flex-col items-start gap-1">  
                                    <p className="font-bold">Adicionar vocábulo</p>
                                    <div className="flex flex-row items-center gap-2">
                                        <FluencyInput
                                            placeholder="Digite o vocábulo"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddVocab((e.target as HTMLInputElement).value, currentImageURL);
                                                }
                                            }}
                                        />
                                        <MdDelete onClick={() => setCurrentImageURL(null)} className="w-8 h-8 text-red-500 hover:text-red-600 duration-300 ease-in-out transition-all cursor-pointer" />
                                    </div>
                                </div>)}
                            </div>

                            <div className="flex flex-col items-stretch gap-1 w-full">
                                <p className="font-bold">Já adicionados</p>
                                {vocabList.map((vocabObj, index) => (
                                    <div key={index} className="flex flex-row items-center justify-between mx-2 gap-2 bg-fluency-pages-light dark:bg-fluency-pages-dark px-2 py-1  rounded-md">
                                        <p>{vocabObj.vocab}</p>
                                        <MdDelete
                                            onClick={() => handleRemoveVocab(index)}
                                            className="cursor-pointer text-red-500"
                                        />
                                    </div>
                                ))}
                            </div>

                        </div>

                        <FluencyButton onClick={handleSaveSet} variant="orange" className="mt-4">
                            Criar Jogo
                        </FluencyButton>
                    </div>
                </div>
            )}
        </div>
    );
}
