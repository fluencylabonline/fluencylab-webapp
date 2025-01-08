"use client";
import React from "react";
import { type Editor } from "@tiptap/react";

//NextReactImports
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@nextui-org/react";

//Icons and Style
import './stylesMobile.scss'

import { FaRedoAlt, FaUndoAlt } from "react-icons/fa";
import { FaArrowDown, FaArrowUp, FaFont, FaItalic } from "react-icons/fa6";
import { LuHighlighter } from "react-icons/lu";
import { PiTextBBold, PiTextAlignCenter, PiTextAlignJustify, PiTextAlignLeft, PiTextAlignRight, PiTextTBold } from "react-icons/pi";
import { GoHorizontalRule } from "react-icons/go";
import { AiOutlineBlock } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";

type Props = {
  editor: Editor | null;
};

const ToolbarMobile = ({ editor }: Props) => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

        const scrollToBottom = () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });
    };
        
    if (!editor) {
        return null;
    }

  return (
    <div className='fixed bottom-0 z-10 flex flex-row flex-wrap items-center justify-center w-[100%] bg-[#dee8e9] dark:bg-[#0a1322] text-md px-3 py-[0.20rem]'>
    
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
      
    <Dropdown>
    <DropdownTrigger>
        <Button 
        variant="bordered" 
        >
        <PiTextTBold className="w-5 h-auto" />
        </Button>
    </DropdownTrigger>
        <DropdownMenu className="p-3 bg-fluency-gray-200 dark:bg-fluency-gray-300 rounded-md" aria-label="Static Actions">
            <DropdownItem onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'p-1 text-md text-fluency-blue-500 font-bold' : 'font-semibold p-1 text-md text-fluency-gray-800 dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out'}>16</DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'p-2 px-2 text-md text-fluency-blue-500 font-bold' : 'p-2 px-2 text-md text-fluency-gray-100 hover:text-fluency-blue-500 duration-300 ease-in-out'}>18</DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={editor.isActive('heading', { level: 4 }) ? 'p-2 px-2 text-md text-fluency-blue-500 font-bold' : 'p-2 px-2 text-md text-fluency-gray-100 hover:text-fluency-blue-500 duration-300 ease-in-out'}>22</DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} className={editor.isActive('heading', { level: 5 }) ? 'p-2 px-2 text-md text-fluency-blue-500 font-bold' : 'p-2 px-2 text-md text-fluency-gray-100 hover:text-fluency-blue-500 duration-300 ease-in-out'}>32</DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} className={editor.isActive('heading', { level: 6 }) ? 'p-2 px-2 text-md text-fluency-blue-500 font-bold' : 'p-2 px-2 text-md text-fluency-gray-100 hover:text-fluency-blue-500 duration-300 ease-in-out'}>48</DropdownItem>
        </DropdownMenu>
    </Dropdown>

    <Dropdown>
    <DropdownTrigger>
        <Button 
        variant="bordered" 
        >
        <FaFont className="w-4 h-auto" />
        </Button>
    </DropdownTrigger>
        <DropdownMenu className="p-3 bg-fluency-gray-200 dark:bg-fluency-gray-300 rounded-md" aria-label="Static Actions">
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

    <Dropdown>
    <DropdownTrigger>
        <Button>
        <PiTextAlignCenter className="w-5 h-auto" />
        </Button>
    </DropdownTrigger>
        <DropdownMenu className="p-3 bg-fluency-gray-200 dark:bg-fluency-gray-300 rounded-md" aria-label="Static Actions">
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

    <Dropdown>
        <DropdownTrigger>
            <Button 
            variant="bordered" 
            >
            <BsThreeDotsVertical className="w-5 h-auto" />
            </Button>
        </DropdownTrigger>
            <DropdownMenu className="p-3 bg-fluency-gray-200 dark:bg-fluency-gray-300 rounded-md" aria-label="Static Actions">
            <DropdownItem onClick={() => editor.chain().focus().setHorizontalRule().run()} className={editor.isActive({ rule: 'rule' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
                <GoHorizontalRule className="w-6 h-auto"/>
            </DropdownItem>
            <DropdownItem onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive({ CodeBlock: 'codebloc' }) ? 'p-2 px-2 text-md text-fluency-blue-500' : 'p-2 px-2 text-md text-fluency-gray-100'}>
                <AiOutlineBlock className="w-5 h-auto" />
            </DropdownItem>
        </DropdownMenu>
    </Dropdown>

    <button onClick={scrollToBottom} className="cursor-pointer text-fluency-gray-500 dark:text-fluency-gray-100 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md" >
        <FaArrowDown className="w-3 h-auto" />
    </button>
    <button className="cursor-pointer text-fluency-gray-500 dark:text-fluency-gray-100 hover:text-fluency-gray-800 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md" >
        <FaArrowUp onClick={scrollToTop} className="w-3 h-auto" />
    </button>

    </div>
  );
};

export default ToolbarMobile;