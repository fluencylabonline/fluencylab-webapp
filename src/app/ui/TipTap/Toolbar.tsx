"use client";
import React, { useCallback, useState } from "react";
import { type Editor } from "@tiptap/react";

//NextReactImports
import { Tooltip } from '@nextui-org/react';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@nextui-org/react";

//Icons and Style
import './styles.scss'
import Link from '@tiptap/extension-link'

import { FaRedoAlt, FaUndoAlt } from "react-icons/fa";
import { LuHeading1, LuHeading2 } from "react-icons/lu";
import { FaFont, FaItalic, FaLink, FaLinkSlash } from "react-icons/fa6";
import { LuHighlighter } from "react-icons/lu";
import { PiTextBBold, PiTextAlignCenter, PiTextAlignJustify, PiTextAlignLeft, PiTextAlignRight, PiTextTBold } from "react-icons/pi";
import { IoImage } from "react-icons/io5";
import { GoHorizontalRule } from "react-icons/go";
import { AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineBlock, AiOutlineColumnWidth, AiOutlineDelete, AiOutlineMergeCells, AiOutlinePlus, AiOutlineSplitCells, AiOutlineTable, AiOutlineTool } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import FluencyInput from "../Components/Input/input";
import FluencyButton from "../Components/Button/button";
import FluencyCloseButton from "../Components/ModalComponents/closeModal";
import { RiTaskLine } from "react-icons/ri";
import { MdOutlineSubtitles } from "react-icons/md";

type Props = {
  editor: Editor | null;
  content: string;
  isTyping: string;
  addImage: any;
  lastSaved: string | null;
  buttonColor: string;
  animation: boolean;
  timeLeft: number;
};

type AddLinkBoxProps = {
  editor: Editor;
  setModal: (state: boolean) => void;
};

export const AddLinkBox = ({ editor, setModal }: AddLinkBoxProps) => {
  const [input, setInput] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input) {
      let url = input;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `http://${url}`;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      setInput("");
      setModal(false);
    }
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
            
            <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-max mx-72 h-full p-4">
                <div className="flex flex-col items-center justify-center p-3">
                    
                    <FluencyCloseButton onClick={() => setModal(false)}/>
                    
                      <h3 className="text-xl leading-6 font-medium mb-2">
                          Adicionar link                         
                      </h3>

                    <form className="flex flex-col gap-2 items-center justify-center w-max p-3" onSubmit={handleSubmit}>
                      <FluencyInput placeholder="Insira o link" value={input} onChange={handleChange}/>
                      <FluencyButton variant="confirm" type="submit">Adicionar</FluencyButton>
                    </form>

                </div>
            </div>
        </div>
    </div>
  );
};



const Toolbar = ({ editor, isTyping, addImage, lastSaved, animation, buttonColor, timeLeft }: Props) => {
  const [selectedFontFamily, setSelectedFontFamily] = useState('QuickSand');
  const [modal, setModal] = useState(false);
  if (!editor) {
    return null;
  }

  return (
    <div className='sticky top-0 z-10 flex flex-row flex-wrap items-center justify-center gap-2 w-[100%] rounded-full bg-[#edf2fa] dark:bg-[#0a1322] text-md px-8 py-[0.25rem]'>
        
        <div role="status">
          <svg aria-hidden="true" className={`w-5 h-5 text-gray-200 ${isTyping ? 'animate-spin fill-fluency-blue-500 ease-in-out transition-all duration-300' : 'flex ease-in-out transition-all duration-300'} dark:text-gray-600`} viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <span className="sr-only">Salvando...</span>
        </div>
   
        <Tooltip
        className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
        content="Desfazer ação (Ctrl + Z)"
        color="primary"
        placement="bottom"
      >
          <button onClick={() => editor.chain().focus().undo().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .undo()
                .run()
            } className={editor.isActive('undo') ? 'cursor-pointer text-fluency-gray-500 dark:text-fluency-gray-100 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
            <FaUndoAlt className="w-3 h-auto" />
          </button>
      </Tooltip>
      
      <Tooltip
          className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
          content="Refazer ação (Ctrl + Y)"
          color="primary"
          placement="bottom"
        >
          <button onClick={() => editor.chain().focus().redo().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .redo()
                .run()
            } className={editor.isActive('redo') ? 'cursor-pointer text-fluency-gray-500 dark:text-fluency-gray-100 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
            <FaRedoAlt className="w-3 h-auto" />
          </button>
      </Tooltip>
      
      <p>|</p>

      <div className="lg:block md:block hidden">
        <Tooltip
            className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
            content="Título H1"
            color="primary"
            placement="bottom"
          >
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
          <LuHeading1 className="w-5 h-auto" />
          </button>
        </Tooltip>

        <Tooltip
            className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
            content="Título H2"
            color="primary"
            placement="bottom"
          >
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
          <LuHeading2 className="w-5 h-auto" />
          </button>
        </Tooltip>

        {/*Admin button */}
        <Tooltip
            className='text-xs font-bold bg-fluency-yellow-200 rounded-md p-1'
            content="Destacar texto"
            color="primary"
            placement="bottom"
          >
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'text-fluency-yellow-500 dark:text-fluency-yellow-600 hover:text-fluency-yellow-700 duration-150 transition-all ease-in-out bg-fluency-yellow-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-yellow-500 dark:hover:text-fluency-yellow-800 hover:bg-fluency-yellow-100 dark:hover:bg-fluency-yellow-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
            <MdOutlineSubtitles className="w-5 h-auto" />
          </button>
        </Tooltip>

      </div>

      <Dropdown>
        <DropdownTrigger>
          <Button 
            variant="bordered" 
            className="lg:hidden md:hidden block"
          >
            <PiTextTBold className="w-5 h-auto" />
          </Button>
        </DropdownTrigger>
          <DropdownMenu className="p-3 bg-fluency-gray-200 dark:bg-fluency-gray-300 rounded-md" aria-label="Static Actions">
            <DropdownItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <LuHeading1 className="w-5 h-auto" />
            </DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <LuHeading2 className="w-5 h-auto" />
            </DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'p-2 px-2 text-md text-fluency-blue-500 font-bold' : 'p-2 px-2 text-md text-fluency-gray-800 hover:text-fluency-blue-500 duration-300 ease-in-out'}>18</DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={editor.isActive('heading', { level: 4 }) ? 'p-2 px-2 text-md text-fluency-blue-500 font-bold' : 'p-2 px-2 text-md text-fluency-gray-800 hover:text-fluency-blue-500 duration-300 ease-in-out'}>22</DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} className={editor.isActive('heading', { level: 5 }) ? 'p-2 px-2 text-md text-fluency-blue-500 font-bold' : 'p-2 px-2 text-md text-fluency-gray-800 hover:text-fluency-blue-500 duration-300 ease-in-out'}>32</DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} className={editor.isActive('heading', { level: 6 }) ? 'p-2 px-2 text-md text-fluency-blue-500 font-bold' : 'p-2 px-2 text-md text-fluency-gray-800 hover:text-fluency-blue-500 duration-300 ease-in-out'}>48</DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <p>|</p>

      <div className="lg:flex lg:flex-row md:flex md:flex-row items-center gap-2 hidden">
        <Tooltip
            className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
            content="Fonte"
            color="primary"
            placement="bottom"
            >
            <div>
              <select
                value={selectedFontFamily}
                onChange={(e) => {
                  const newFontFamily = e.target.value;
                  setSelectedFontFamily(newFontFamily);
                  editor.chain().focus().setFontFamily(newFontFamily).run();
                }}
                className={editor.isActive('fontfamily') ? 'text-fluency-gray-500 dark:text-fluency-gray-100 bg-fluency-blue-100 dark:bg-fluency-blue-900 rounded-md p-1 px-2 text-sm font-semibold' : 'text-fluency-gray-500 dark:text-fluency-gray-100 bg-fluency-blue-100 dark:bg-fluency-blue-900 font-semibold rounded-md p-1 px-2 text-sm'}
              >
                <option value="QuickSand">QuickSand</option>
                <option value="Inter">Inter</option>
                <option value="Monospace">Monospace</option>
                <option value="Arial">Arial</option>
              </select>
            </div>
        </Tooltip>

        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className={editor.isActive('paragraph') ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
              <PiTextTBold className="w-5 h-auto" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu className="bg-fluency-pages-light dark:bg-fluency-gray-500 p-2 rounded-md font-bold">
            <DropdownItem><button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'p-1 text-md text-fluency-blue-500 font-bold' : 'font-semibold p-1 text-md text-fluency-gray-800 dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out'}>18</button></DropdownItem>
            <DropdownItem><button onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={editor.isActive('heading', { level: 4 }) ? 'p-1 text-md text-fluency-blue-500 font-bold' : 'font-semibold p-1 text-md text-fluency-gray-800 dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out'}>22</button></DropdownItem>
            <DropdownItem><button onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} className={editor.isActive('heading', { level: 5 }) ? 'p-1 text-md text-fluency-blue-500 font-bold' : 'font-semibold p-1 text-md text-fluency-gray-800 dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out'}>32</button></DropdownItem>
            <DropdownItem><button onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} className={editor.isActive('heading', { level: 6 }) ? 'p-1 text-md text-fluency-blue-500 font-bold' : 'font-semibold p-1 text-md text-fluency-gray-800 dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out'}>48</button></DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>


      <div className="lg:flex flex-row items-center md:block hidden">
        <Tooltip
            className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
            content="Negrito (Ctrl + B)"
            color="primary"
            placement="bottom"
          >
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
          <PiTextBBold className="w-5 h-auto" />
          </button>
        </Tooltip>

        <Tooltip
            className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
            content="Itálico (Ctrl + I)"
            color="primary"
            placement="bottom"
          >
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
          <FaItalic  className="w-4 h-auto" />
          </button>
        </Tooltip>

        <Tooltip
            className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
            content="Marcador"
            color="primary"
            placement="bottom"
          >
          <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
          <LuHighlighter className="w-5 h-auto" />
          </button>
        </Tooltip>
      </div>

      <Dropdown>
        <DropdownTrigger>
          <Button 
            variant="bordered" 
            className="lg:hidden md:hidden block"
          >
            <FaFont className="w-4 h-auto" />
          </Button>
        </DropdownTrigger>
          <DropdownMenu className="p-3 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-md hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600" aria-label="Static Actions">
            <DropdownItem onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <PiTextBBold className="w-5 h-auto" />
            </DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <FaItalic  className="w-4 h-auto" />
            </DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <LuHighlighter className="w-5 h-auto" />
            </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <p>|</p>

      <div className="lg:block md:block hidden">
        <Tooltip
            className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
            content="Alinhar à esquerda (Ctrl + L)"
            color="primary"
            placement="bottom"
          >
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
            <PiTextAlignLeft className="w-5 h-auto" />
            </button>
        </Tooltip>

        <Tooltip
            className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
            content="Alinhar ao centro (Ctrl + E)"
            color="primary"
            placement="bottom"
          >
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
            <PiTextAlignCenter className="w-5 h-auto" />
            </button>
        </Tooltip>

        <Tooltip
            className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
            content="Alinhar à direita (Ctrl + R)"
            color="primary"
            placement="bottom"
          >
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
            <PiTextAlignRight className="w-5 h-auto" />
            </button>
        </Tooltip>

        <Tooltip
            className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
            content="Justificar texto (Ctrl + J)"
            color="primary"
            placement="bottom"
          >
            <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
            <PiTextAlignJustify className="w-5 h-auto" />
            </button>
        </Tooltip>
      </div>

      <Dropdown>
        <DropdownTrigger>
          <Button 
            variant="bordered" 
            className="lg:hidden md:hidden block"
          >
            <PiTextAlignCenter className="w-5 h-auto" />
          </Button>
        </DropdownTrigger>
          <DropdownMenu className="p-3 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600" aria-label="Static Actions">
            <DropdownItem onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <PiTextAlignLeft className="w-5 h-auto" />
            </DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <PiTextAlignCenter className="w-5 h-auto" />
            </DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <PiTextAlignRight className="w-5 h-auto" />
            </DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <PiTextAlignJustify className="w-5 h-auto" />
            </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <p>|</p>

      <div className="lg:block md:block hidden">

        <Tooltip
          className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
          content="Criar tarefa"
          color="primary"
          placement="bottom"
        >
          <button
          onClick={() => editor.chain().focus().toggleTaskList().run()} 
          className={editor.isActive('taskList') ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
          <RiTaskLine className="w-5 h-auto" />
          </button>
        </Tooltip>

        <Tooltip
            className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
            content="Adicionar imagem com link"
            color="primary"
            placement="bottom"
          >
            <button onClick={addImage} className={editor.isActive('image', {  }) ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
              <IoImage className="w-5 h-auto" />
            </button>
        </Tooltip>


        <Tooltip
            className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
            content="Destacar texto"
            color="primary"
            placement="bottom"
          >
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive({ CodeBlock: 'codebloc' }) ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
            <AiOutlineBlock className="w-5 h-auto" />
          </button>
        </Tooltip>

        <Tooltip
            className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
            content="Criar linha horizontal"
            color="primary"
            placement="bottom"
          >
          <button onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={editor.isActive({ rule: 'rule' }) ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
            <GoHorizontalRule className="w-6 h-auto"/>
          </button>
        </Tooltip>

          {editor.isActive("link") ? (
            <Tooltip
            className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
            content="Remover link"
            color="primary">
            <button
              className={editor.isActive({ unlink: 'unlink' }) ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}
              title="Remove link"
              onClick={() => editor.chain().focus().unsetLink().run()}
            >
              <FaLinkSlash />
            </button>
            </Tooltip>
          ) : (
            <Tooltip 
            className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
            content="Adicionar link"
            color="primary">
            <button 
              className={editor.isActive({ link: 'link' }) ? 'text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}
              title="add a link" onClick={() => setModal(true)}>
              <FaLink />
            </button>
            </Tooltip>
          )}
          {modal && (
            <AddLinkBox editor={editor} setModal={setModal} />
          )}

          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="bordered" 
                className="hidden ml-1 p-1 px-2 text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md"
              >
                <AiOutlineTable className="w-5 h-auto" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu className="p-3 rounded-md bg-fluency-gray-300 dark:bg-fluency-gray-400" aria-label="Table Actions">
              <DropdownItem 
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineTable className="w-5 h-auto" /><span>Insert Table</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().addColumnBefore().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineColumnWidth className="w-5 h-auto" /><span>Add Column Before</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().addColumnAfter().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineColumnWidth className="w-5 h-auto" /><span>Add Column After</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().deleteColumn().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineDelete className="w-5 h-auto" /><span>Delete Column</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().addRowBefore().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlinePlus className="w-5 h-auto" /><span>Add Row Before</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().addRowAfter().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlinePlus className="w-5 h-auto" /><span>Add Row After</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().deleteRow().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineDelete className="w-5 h-auto" /><span>Delete Row</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().deleteTable().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineDelete className="w-5 h-auto" /><span>Delete Table</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().mergeCells().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineMergeCells className="w-5 h-auto" /><span>Merge Cells</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().splitCell().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineSplitCells className="w-5 h-auto" /><span>Split Cell</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().toggleHeaderColumn().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineColumnWidth className="w-5 h-auto" /><span>Toggle Header Column</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().toggleHeaderRow().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineColumnWidth className="w-5 h-auto" /><span>Toggle Header Row</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().toggleHeaderCell().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineColumnWidth className="w-5 h-auto" /><span>Toggle Header Cell</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().mergeOrSplit().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineMergeCells className="w-5 h-auto" /><span>Merge or Split</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().setCellAttribute('colspan', 2).run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineColumnWidth className="w-5 h-auto" /><span>Set Cell Attribute</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().fixTables().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineTool className="w-5 h-auto" /><span>Fix Tables</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().goToNextCell().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineArrowRight className="w-5 h-auto" /><span>Go to Next Cell</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={() => editor.chain().focus().goToPreviousCell().run()} 
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2"><AiOutlineArrowLeft className="w-5 h-auto" /><span>Go to Previous Cell</span></p>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
      </div>
      
      <Dropdown>
        <DropdownTrigger>
          <Button 
            variant="bordered" 
            className="lg:hidden md:hidden block"
          >
            <BsThreeDotsVertical className="w-5 h-auto" />
          </Button>
        </DropdownTrigger>
          <DropdownMenu className="p-3 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600" aria-label="Static Actions">
            <DropdownItem onClick={() => editor.chain().focus().setHorizontalRule().run()} className={editor.isActive({ rule: 'rule' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <GoHorizontalRule className="w-6 h-auto"/>
            </DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive({ CodeBlock: 'codebloc' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <AiOutlineBlock className="w-5 h-auto" />
            </DropdownItem>
            <DropdownItem onClick={addImage} className={editor.isActive('image', {  }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <IoImage className="w-5 h-auto" />
            </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <button
        className={`hidden ml-4 save-button ${animation ? 'animate' : ''}`}
        style={{ backgroundColor: buttonColor }}
      >
      </button>
      <div className='hidden'>
        Time until next save: {Math.floor(timeLeft / 60000)}:{('0' + Math.floor((timeLeft % 60000) / 1000)).slice(-2)}
      </div>


    </div>
  );
};

export default Toolbar;