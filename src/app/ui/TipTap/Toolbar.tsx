"use client";
import React, { useState } from "react";
import { type Editor } from "@tiptap/react";

//NextReactImports
import { Tooltip } from '@nextui-org/react';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@nextui-org/react";

//Icons and Style
import './styles.scss'

import { FaRedoAlt, FaUndoAlt } from "react-icons/fa";
import { LuHeading1, LuHeading2,LuHeading3 } from "react-icons/lu";
import { FaItalic } from "react-icons/fa6";
import { LuHighlighter } from "react-icons/lu";
import { PiTextBBold, PiTextAlignCenter, PiTextAlignJustify, PiTextAlignLeft, PiTextAlignRight, PiTextTBold } from "react-icons/pi";
import { IoImage } from "react-icons/io5";
import { GoHorizontalRule } from "react-icons/go";
import { AiOutlineBlock } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";

type Props = {
  editor: Editor | null;
  content: string;
  isTyping: string;
  addImage: any;
};

const Toolbar = ({ editor, isTyping, addImage }: Props) => {
  const [selectedFontSize, setSelectedFontSize] = useState("16");
  const [selectedFontFamily, setSelectedFontFamily] = useState('QuickSand');

  if (!editor) {
    return null;
  }
  
  const handleFontSizeChange = (event: { target: { value: any; }; }) => {
    const newSize = event.target.value;
    setSelectedFontSize(newSize);
    editor.chain().focus().setFontSize(`${newSize}px`).run();
  };
  
  const decreaseFontSize = () => {
    let newSize = parseInt(selectedFontSize, 10) - 2; // Decrease font size by 2
    if (newSize < 8) {
        newSize = 8; // Ensure minimum font size is 8
    }
    setSelectedFontSize(`${newSize}`);
    editor.chain().focus().setFontSize(`${newSize}px`).run();
};

const increaseFontSize = () => {
    let newSize = parseInt(selectedFontSize, 10) + 2; // Increase font size by 2
    if (newSize > 48) {
        newSize = 48; // Ensure maximum font size is 48
    }
    setSelectedFontSize(`${newSize}`);
    editor.chain().focus().setFontSize(`${newSize}px`).run();
};


  
  return (
    <div className='sticky top-0 z-50 flex flex-row flex-wrap items-center justify-center gap-2 w-full rounded-full bg-[#edf2fa] dark:bg-[#0a1322] text-md px-8 py-[0.25rem]'>
      
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

      <Tooltip
          className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
          content="Título H1"
          color="primary"
          placement="bottom"
        >
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'text-fluency-gray-500 dark:text-fluency-gray-600 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
        <LuHeading1 className="w-5 h-auto" />
        </button>
      </Tooltip>


      <Tooltip
          className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
          content="Título H2"
          color="primary"
          placement="bottom"
        >
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'text-fluency-gray-500 dark:text-fluency-gray-600 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
        <LuHeading2 className="w-5 h-auto" />
        </button>
      </Tooltip>
      
      
      <Tooltip
          className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
          content="Título H3"
          color="primary"
          placement="bottom"
        >
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'text-fluency-gray-500 dark:text-fluency-gray-600 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
        <LuHeading3 className="w-5 h-auto" />
        </button>
      </Tooltip>

      <Tooltip
          className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
          content="Texto normal"
          color="primary"
          placement="bottom"
        >
        <button onClick={() => editor.chain().focus().setParagraph().run() && editor.chain().focus().setFontSize('16px').run()} className={editor.isActive('paragraph') ? 'text-fluency-gray-500 dark:text-fluency-gray-600 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
        <PiTextTBold className="w-5 h-auto" />
        </button>
      </Tooltip>

      <p>|</p>

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


        <div className="flex flex-row gap-2 items-center justify-center w-min">
          <Tooltip
                className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
                content="Diminuir fonte"
                color="primary"
                placement="bottom"
              >
            <button onClick={decreaseFontSize} className="text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all p-1 px-2 rounded-md font-bold text-xl">
              -</button>
          </Tooltip>  
                    
            <select
              value={selectedFontSize}
              onChange={handleFontSizeChange}
              className={editor.isActive('fontsize') ? 'text-fluency-gray-500 dark:text-fluency-gray-100 bg-fluency-blue-100 dark:bg-fluency-blue-900 font-semibold rounded-md appearance-none p-1 px-2 text-md' : 'appearance-none outline-none text-fluency-gray-500 dark:text-fluency-gray-100 bg-fluency-blue-100 dark:bg-fluency-blue-900 font-semibold rounded-md p-1 px-2 text-md'}>
              {[8, 10, 12, 14, 16, 18, 20, 22, 28, 36, 42, 48].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

          <Tooltip
                className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
                content="Aumentar fonte"
                color="primary"
                placement="bottom"
              >
            <button onClick={increaseFontSize} className="text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all p-1 px-2 rounded-md font-bold text-xl">
              +</button>
          </Tooltip>
        </div>


      <Tooltip
          className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
          content="Negrito (Ctrl + B)"
          color="primary"
          placement="bottom"
        >
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'text-fluency-gray-500 dark:text-fluency-gray-600 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
        <PiTextBBold className="w-5 h-auto" />
        </button>
      </Tooltip>


      <Tooltip
          className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
          content="Itálico (Ctrl + I)"
          color="primary"
          placement="bottom"
        >
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'text-fluency-gray-500 dark:text-fluency-gray-600 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
        <FaItalic  className="w-4 h-auto" />
        </button>
      </Tooltip>


      <Tooltip
          className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
          content="Marcador"
          color="primary"
          placement="bottom"
        >
        <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'text-fluency-gray-500 dark:text-fluency-gray-600 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
        <LuHighlighter className="w-5 h-auto" />
        </button>
      </Tooltip>


      <p>|</p>

      <div className="lg:block md:block hidden">
      <Tooltip
          className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
          content="Alinhar à esquerda (Ctrl + L)"
          color="primary"
          placement="bottom"
        >
          <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'text-fluency-gray-500 dark:text-fluency-gray-600 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
          <PiTextAlignLeft className="w-5 h-auto" />
          </button>
      </Tooltip>


      <Tooltip
          className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
          content="Alinhar ao centro (Ctrl + E)"
          color="primary"
          placement="bottom"
        >
          <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'text-fluency-gray-500 dark:text-fluency-gray-600 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
          <PiTextAlignCenter className="w-5 h-auto" />
          </button>
      </Tooltip>


      <Tooltip
          className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
          content="Alinhar à direita (Ctrl + R)"
          color="primary"
          placement="bottom"
        >
          <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'text-fluency-gray-500 dark:text-fluency-gray-600 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
          <PiTextAlignRight className="w-5 h-auto" />
          </button>
      </Tooltip>


      <Tooltip
          className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1'
          content="Justificar texto (Ctrl + J)"
          color="primary"
          placement="bottom"
        >
          <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'text-fluency-gray-500 dark:text-fluency-gray-600 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
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
            <DropdownItem onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <PiTextAlignJustify className="w-5 h-auto" />
            </DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <PiTextAlignJustify className="w-5 h-auto" />
            </DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <PiTextAlignJustify className="w-5 h-auto" />
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
          content="Adicionar imagem com link"
          color="primary"
          placement="bottom"
        >
          <button onClick={addImage} className={editor.isActive('image', {  }) ? 'text-fluency-gray-500 dark:text-fluency-gray-600 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
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
          className={editor.isActive({ CodeBlock: 'codebloc' }) ? 'text-fluency-gray-500 dark:text-fluency-gray-600 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
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
          className={editor.isActive({ rule: 'rule' }) ? 'text-fluency-gray-500 dark:text-fluency-gray-600 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md' : 'text-fluency-gray-400 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-fluency-blue-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-200 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md'}>
          <GoHorizontalRule className="w-6 h-auto"/>
        </button>
      </Tooltip>
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
            <DropdownItem onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <GoHorizontalRule className="w-6 h-auto"/>
            </DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <AiOutlineBlock className="w-5 h-auto" />
            </DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
              <IoImage className="w-5 h-auto" />
            </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      </div>
  );
};

export default Toolbar;