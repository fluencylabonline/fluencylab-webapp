'use client'
import { useState, ChangeEvent, useEffect } from "react";

import { TiUpload } from "react-icons/ti";
import { BsThreeDotsVertical } from "react-icons/bs";

import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@nextui-org/react";

import { db } from "@/app/firebase";
import { deleteObject, getDownloadURL, getStorage, listAll, ref, uploadBytes } from "firebase/storage";

import {toast, Toaster} from "react-hot-toast";

export default function Apostilas() {
    const [inglesWorkbooks, setInglesWorkbooks] = useState<string[]>([]);
    const [espanholWorkbooks, setEspanholWorkbooks] = useState<string[]>([]);
    const [librasWorkbooks, setLibrasWorkbooks] = useState<string[]>([]);

    const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>, language: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const storageRef = ref(getStorage(), `/${language}/${file.name}`);
        try {
            await uploadBytes(storageRef, file);
            toast.success('Upload Feito!');
            // Refresh the list of workbooks after uploading a new one
            fetchWorkbooks(language);
        } catch (error) {
            console.error('Error uploading file: ', error);
            toast.error('Failed to upload file. Please try again.');
        }
    };

    const fetchWorkbooks = async (language: string) => {
        const storage = getStorage();
        const languageFolderRef = ref(storage, `/${language}/`);
        try {
            const languageFolderList = await listAll(languageFolderRef);
            const workbookNames = languageFolderList.items.map(item => item.name);
            switch (language) {
                case 'ingles':
                    setInglesWorkbooks(workbookNames);
                    break;
                case 'espanhol':
                    setEspanholWorkbooks(workbookNames);
                    break;
                case 'libras':
                    setLibrasWorkbooks(workbookNames);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Error fetching workbooks: ', error);
            toast.error('Failed to fetch workbooks. Please try again.');
        }
    };

    useEffect(() => {
        // Fetch the list of workbooks for each language when the component mounts
        fetchWorkbooks('ingles');
        fetchWorkbooks('espanhol');
        fetchWorkbooks('libras');
    }, []);

    const handleDownload = async (workbook: string, language: string) => {
        const storage = getStorage();
        const workbookRef = ref(storage, `/${language}/${workbook}`);
        try {
            const url = await getDownloadURL(workbookRef);
            // Use the URL to download the workbook
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error downloading workbook: ', error);
            toast.error('Failed to download workbook. Please try again.');
        }
    };
    
    const handleDelete = async (workbook: string, language: string) => {
        const storage = getStorage();
        const workbookRef = ref(storage, `/${language}/${workbook}`);
        try {
            await deleteObject(workbookRef);
            // Refresh the list of workbooks after deleting
            fetchWorkbooks(language);
            toast.error('Deletado!');
        } catch (error) {
            console.error('Error deleting workbook: ', error);
            toast.error('Failed to delete workbook. Please try again.');
        }
    };
    
    return (
        <div className=" w-full flex flex-col gap-3 items-start overflow-y-scroll h-[92vh] p-4 rounded-md">
            <div className="bg-fluency-blue-100 dark:bg-fluency-gray-800 w-full p-2 px-6 rounded-md gap-2">
                <div className="flex flex-row justify-between items-center">
                    <p className="font-bold p-2 pb-3 text-2xl">Inglês</p>
                    <label>
                        <input onChange={(e) => handleFileUpload(e, 'ingles')} type="file" className="text-sm text-grey-500 file:mr-5 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-fluency-blue-200 file:text-fluency-blue-700 hover:file:cursor-pointer hover:file:bg-fluency-orange-100 hover:file:text-fluency-orange-700" />
                    </label>
                </div>
                <div className="pb-2">
                    <ul className="flex flex-wrap gap-2">
                        {inglesWorkbooks.map(workbook => (
                            <li key={workbook} className="w-36 h-52 text-center px-3 bg-fluency-blue-200 dark:bg-fluency-gray-600 hover:bg-fluency-blue-300 hover:dark:bg-fluency-gray-700 duration-300 ease-in-out transition-all rounded-sm flex flex-col items-center justify-center font-semibold">
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button className="relative -top-12 left-14">
                                            <BsThreeDotsVertical className="w-4 h-auto hover:text-fluency-blue-700 duration-300 ease-in-out transition-all" />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu className="bg-fluency-bg-light dark:bg-fluency-bg-dark p-2 rounded-md" aria-label="Static Actions">
                                        <DropdownItem className="dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out transition-all" key="new" onClick={() => handleDelete(workbook, 'ingles')}>Deletar</DropdownItem>
                                        <DropdownItem className="dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out transition-all" key="copy" onClick={() => handleDownload(workbook, 'ingles')}>Baixar</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                                <span className="mb-8">{workbook}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Spanish */}
            <div className="bg-fluency-blue-100 dark:bg-fluency-gray-800 w-full p-2 px-6 rounded-md gap-2">
                <div className="flex flex-row justify-between items-center">
                    <p className="font-bold p-2 pb-3 text-2xl">Espanhol</p>
                    <label>
                        <input onChange={(e) => handleFileUpload(e, 'espanhol')} type="file" className="text-sm text-grey-500 file:mr-5 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-fluency-blue-200 file:text-fluency-blue-700 hover:file:cursor-pointer hover:file:bg-fluency-orange-100 hover:file:text-fluency-orange-700" />
                    </label>
                </div>
                <div className="pb-2">
                    <ul className="flex flex-wrap gap-2">
                        {espanholWorkbooks.map(workbook => (
                            <li key={workbook} className="w-36 h-52 text-center px-3 bg-fluency-blue-200 dark:bg-fluency-gray-600 hover:bg-fluency-blue-300 hover:dark:bg-fluency-gray-700 duration-300 ease-in-out transition-all rounded-sm flex flex-col items-center justify-center font-semibold">
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button className="relative -top-12 left-14">
                                            <BsThreeDotsVertical className="w-4 h-auto hover:text-fluency-blue-700 duration-300 ease-in-out transition-all" />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu className="bg-fluency-bg-light dark:bg-fluency-bg-dark p-2 rounded-md" aria-label="Static Actions">
                                        <DropdownItem className="dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out transition-all" key="new" onClick={() => handleDelete(workbook, 'espanhol')}>Deletar</DropdownItem>
                                        <DropdownItem className="dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out transition-all" key="copy" onClick={() => handleDownload(workbook, 'espanhol')}>Baixar</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                                <span className="mb-8">{workbook}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Portuguese */}
            <div className="bg-fluency-blue-100 dark:bg-fluency-gray-800 w-full p-2 px-6 rounded-md gap-2">
                <div className="flex flex-row justify-between items-center">
                    <p className="font-bold p-2 pb-3 text-2xl">Libras</p>
                    <label>
                        <input onChange={(e) => handleFileUpload(e, 'libras')} type="file" className="text-sm text-grey-500 file:mr-5 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-fluency-blue-200 file:text-fluency-blue-700 hover:file:cursor-pointer hover:file:bg-fluency-orange-100 hover:file:text-fluency-orange-700" />
                    </label>
                </div>
                <div className="pb-2">
                    <ul className="flex flex-wrap gap-2">
                        {librasWorkbooks.map(workbook => (
                            <li key={workbook} className="w-36 h-52 text-center px-3 bg-fluency-blue-200 dark:bg-fluency-gray-600 hover:bg-fluency-blue-300 hover:dark:bg-fluency-gray-700 duration-300 ease-in-out transition-all rounded-sm flex flex-col items-center justify-center font-semibold">
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button className="relative -top-12 left-14">
                                            <BsThreeDotsVertical className="w-4 h-auto hover:text-fluency-blue-700 duration-300 ease-in-out transition-all" />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu className="bg-fluency-bg-light dark:bg-fluency-bg-dark p-2 rounded-md" aria-label="Static Actions">
                                        <DropdownItem className="dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out transition-all" key="new" onClick={() => handleDelete(workbook, 'libras')}>Deletar</DropdownItem>
                                        <DropdownItem className="dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out transition-all" key="copy" onClick={() => handleDownload(workbook, 'libras')}>Baixar</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                                <span className="mb-8">{workbook}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        <Toaster />
        </div>
    );
}
