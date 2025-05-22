"use client";
import React, { useState } from "react";
import { type Editor } from "@tiptap/react";
import { motion, AnimatePresence } from "framer-motion";

//NextReactImports
import { Tooltip } from "@nextui-org/react";

//Icons and Style
import "./StylesTipTapMobile.scss";
import { FaArrowDown, FaArrowUp, FaRedoAlt, FaUndoAlt } from "react-icons/fa";
import { LuHeading1, LuHeading2 } from "react-icons/lu";
import { FaFont, FaItalic, FaLink, FaLinkSlash } from "react-icons/fa6";
import { LuHighlighter } from "react-icons/lu";
import {
  PiTextBBold,
  PiTextAlignCenter,
  PiTextAlignJustify,
  PiTextAlignLeft,
  PiTextAlignRight,
  PiTextTBold,
} from "react-icons/pi";
import { GoHorizontalRule } from "react-icons/go";
import {
  AiOutlineBlock,
  AiOutlineColumnWidth,
  AiOutlineDelete,
  AiOutlineMergeCells,
  AiOutlinePlus,
  AiOutlineSplitCells,
  AiOutlineTable,
} from "react-icons/ai";
import { PiTextAUnderlineDuotone } from "react-icons/pi";

import FluencyInput from "@/app/ui/Components/Input/input";
import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal";

type Props = {
  editor: Editor | null;
  content: string;
};

const ToolbarMobile = ({ editor }: Props) => {
  const [modal, setModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // State for controlling various dropdown menus
  const [textSizeSelect, setTextSizeSelect] = useState(false);
  const [fontStylesSelect, setFontStylesSelect] = useState(false);
  const [textAlignSelect, setTextAlignSelect] = useState(false);
  const [tableSelect, setTableSelect] = useState(false);
  const [moreOptionsSelect, setMoreOptionsSelect] = useState(false);

  // Animation variants
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  if (!editor) {
    return null;
  }

  const handleLinkSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (linkUrl) {
      // Format URL with http:// if not already included
      let url = linkUrl;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `http://${url}`;
      }

      // Apply link to selected text
      editor
        .chain()
        .focus()
        .extendMarkRange("link") // Extend selection to include entire link if cursor is within existing link
        .setLink({ href: url })
        .run();

      // Reset state and close modal
      setLinkUrl("");
      setModal(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  // Close all dropdowns except the one being toggled
  const toggleDropdown = (dropdown: string) => {
    if (dropdown === "textSize") {
      setTextSizeSelect(!textSizeSelect);
      setFontStylesSelect(false);
      setTextAlignSelect(false);
      setTableSelect(false);
      setMoreOptionsSelect(false);
    } else if (dropdown === "fontStyles") {
      setFontStylesSelect(!fontStylesSelect);
      setTextSizeSelect(false);
      setTextAlignSelect(false);
      setTableSelect(false);
      setMoreOptionsSelect(false);
    } else if (dropdown === "textAlign") {
      setTextAlignSelect(!textAlignSelect);
      setTextSizeSelect(false);
      setFontStylesSelect(false);
      setTableSelect(false);
      setMoreOptionsSelect(false);
    } else if (dropdown === "table") {
      setTableSelect(!tableSelect);
      setTextSizeSelect(false);
      setFontStylesSelect(false);
      setTextAlignSelect(false);
      setMoreOptionsSelect(false);
    } else if (dropdown === "moreOptions") {
      setMoreOptionsSelect(!moreOptionsSelect);
      setTextSizeSelect(false);
      setFontStylesSelect(false);
      setTextAlignSelect(false);
      setTableSelect(false);
    }
  };

  return (
    <div className="fixed bottom-0 z-10 flex flex-col flex-wrap items-center justify-center w-full rounded-t-2xl bg-[#B7B7F4] dark:bg-[#21212A] text-md">
      {modal && (
        <motion.div
          className="w-full rounded-t-2xl bg-[#B7B7F4] dark:bg-[#21212A] flex flex-row flex-wrap items-center justify-center px-0 py-[0.1rem]"
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="flex flex-col items-center justify-center p-3">
            <FluencyCloseButton onClick={() => setModal(false)} />
            <form
              className="flex flex-row gap-2 items-center justify-center w-max p-2"
              onSubmit={handleLinkSubmit}
            >
              <FluencyInput
                className="!py-1"
                placeholder="Insira o link"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <button type="submit">
                <AiOutlinePlus className="w-5 h-auto" />
              </button>
            </form>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {textSizeSelect && (
          <motion.div
            className="w-full rounded-t-2xl flex flex-row flex-wrap items-center justify-center px-0 py-[0.1rem]"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={
                editor.isActive("heading", { level: 1 })
                  ? "p-2 px-2 text-md text-fluency-blue-500"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              <LuHeading1 className="w-5 h-auto" />
            </div>
            <div
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={
                editor.isActive("heading", { level: 2 })
                  ? "p-2 px-2 text-md text-fluency-blue-500"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              <LuHeading2 className="w-5 h-auto" />
            </div>
            <div
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={
                editor.isActive("paragraph")
                  ? "p-2 px-2 text-md text-fluency-blue-500 font-bold"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              16
            </div>
            <div
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className={
                editor.isActive("heading", { level: 3 })
                  ? "p-2 px-2 text-md text-fluency-blue-500 font-bold"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              18
            </div>
            <div
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 4 }).run()
              }
              className={
                editor.isActive("heading", { level: 4 })
                  ? "p-2 px-2 text-md text-fluency-blue-500 font-bold"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              22
            </div>
            <div
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 5 }).run()
              }
              className={
                editor.isActive("heading", { level: 5 })
                  ? "p-2 px-2 text-md text-fluency-blue-500 font-bold"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              32
            </div>
            <div
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 6 }).run()
              }
              className={
                editor.isActive("heading", { level: 6 })
                  ? "p-2 px-2 text-md text-fluency-blue-500 font-bold"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              48
            </div>
          </motion.div>
        )}

        {fontStylesSelect && (
          <motion.div
            className="w-full rounded-t-2xl flex flex-row flex-wrap items-center justify-center px-0 py-[0.1rem]"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={
                editor.isActive("bold")
                  ? "p-2 px-2 text-md text-fluency-blue-500"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              <PiTextBBold className="w-5 h-auto" />
            </div>
            <div
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={
                editor.isActive("italic")
                  ? "p-2 px-2 text-md text-fluency-blue-500"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              <FaItalic className="w-4 h-auto" />
            </div>
            <div
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={
                editor.isActive("highlight")
                  ? "p-2 px-2 text-md text-fluency-blue-500"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              <LuHighlighter className="w-5 h-auto" />
            </div>
            <div
              onClick={() => setModal(!modal)}
              className={
                editor.isActive("link")
                  ? "p-2 px-2 text-md text-fluency-blue-500"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              <FaLink className="w-4 h-auto" />
            </div>
            <div
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-2 px-2 text-md text-fluency-gray-100"
            >
              <FaLinkSlash className="w-4 h-auto" />
            </div>
          </motion.div>
        )}

        {textAlignSelect && (
          <motion.div
            className="w-full rounded-t-2xl flex flex-row flex-wrap items-center justify-center px-0 py-[0.1rem]"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={
                editor.isActive({ textAlign: "left" })
                  ? "p-2 px-2 text-md text-fluency-blue-500"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              <PiTextAlignLeft className="w-5 h-auto" />
            </div>
            <div
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className={
                editor.isActive({ textAlign: "center" })
                  ? "p-2 px-2 text-md text-fluency-blue-500"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              <PiTextAlignCenter className="w-5 h-auto" />
            </div>
            <div
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={
                editor.isActive({ textAlign: "right" })
                  ? "p-2 px-2 text-md text-fluency-blue-500"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              <PiTextAlignRight className="w-5 h-auto" />
            </div>
            <div
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              className={
                editor.isActive({ textAlign: "justify" })
                  ? "p-2 px-2 text-md text-fluency-blue-500"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              <PiTextAlignJustify className="w-5 h-auto" />
            </div>
          </motion.div>
        )}

        {tableSelect && (
          <motion.div
            className="w-full rounded-t-2xl flex flex-row flex-wrap items-center justify-center px-0 py-[0.1rem]"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
              className="p-2 px-2 text-md text-fluency-gray-100"
            >
              <AiOutlineTable className="w-5 h-auto" />
            </div>
            <div
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="p-2 px-2 text-md text-fluency-gray-100"
            >
              <AiOutlineColumnWidth className="w-5 h-auto" />
            </div>
            <div
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="p-2 px-2 text-md text-fluency-gray-100"
            >
              <AiOutlinePlus className="w-5 h-auto" />
            </div>
            <div
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="p-2 px-2 text-md text-fluency-gray-100"
            >
              <AiOutlineDelete className="w-5 h-auto" />
            </div>
            <div
              onClick={() => editor.chain().focus().mergeCells().run()}
              className="p-2 px-2 text-md text-fluency-gray-100"
            >
              <AiOutlineMergeCells className="w-5 h-auto" />
            </div>
            <div
              onClick={() => editor.chain().focus().splitCell().run()}
              className="p-2 px-2 text-md text-fluency-gray-100"
            >
              <AiOutlineSplitCells className="w-5 h-auto" />
            </div>
          </motion.div>
        )}

        {moreOptionsSelect && (
          <motion.div
            className="w-full rounded-t-2xl flex flex-row flex-wrap items-center justify-center px-0 py-[0.1rem]"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className={
                editor.isActive({ rule: "rule" })
                  ? "p-2 px-2 text-md text-fluency-blue-500"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              <GoHorizontalRule className="w-6 h-auto" />
            </div>
            <div
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={
                editor.isActive({ CodeBlock: "codeblock" })
                  ? "p-2 px-2 text-md text-fluency-blue-500"
                  : "p-2 px-2 text-md text-fluency-gray-100"
              }
            >
              <AiOutlineBlock className="w-5 h-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*MAIN TOOLBAR*/}
      <div className="flex flex-row flex-wrap w-full rounded-t-2xl bg-[#E6E6F8] dark:bg-[#0D0D0D] items-center justify-around px-0 py-[0.25rem]">
        <div className="flex flex-row items-center">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className={
              editor.isActive("undo")
                ? "text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md"
                : "text-fluency-gray-800 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-white dark:hover:bg-fluency-blue-900 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md"
            }
          >
            <FaUndoAlt className="w-3 h-auto" />
          </button>

          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className={
              editor.isActive("redo")
                ? "text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md"
                : "text-fluency-gray-800 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-white dark:hover:bg-fluency-blue-900 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md"
            }
          >
            <FaRedoAlt className="w-3 h-auto" />
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleDropdown("textSize")}
          className={
            editor.isActive("fontStyles")
              ? "text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md"
              : "text-fluency-gray-800 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-white dark:hover:bg-fluency-blue-900 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md"
          }
        >
          <PiTextTBold className="w-4 h-auto rounded-md" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleDropdown("fontStyles")}
          className={
            editor.isActive("fontStyles")
              ? "text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md"
              : "text-fluency-gray-800 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-white dark:hover:bg-fluency-blue-900 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md"
          }
        >
          <PiTextAUnderlineDuotone className="w-4 h-auto" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleDropdown("textAlign")}
          className={
            editor.isActive("textAlign")
              ? "text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md"
              : "text-fluency-gray-800 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-white dark:hover:bg-fluency-blue-900 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md"
          }
        >
          <PiTextAlignCenter className="w-4 h-auto" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleDropdown("table")}
          className={
            editor.isActive({ table: "table" })
              ? "text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md"
              : "text-fluency-gray-800 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-white dark:hover:bg-fluency-blue-900 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md"
          }
        >
          <AiOutlineTable className="w-4 h-auto" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleDropdown("moreOptions")}
          className={
            editor.isActive("moreOptions")
              ? "text-fluency-blue-500 dark:text-fluency-blue-600 hover:text-fluency-blue-700 duration-150 transition-all ease-in-out bg-fluency-blue-100 rounded-md p-2 px-2 text-md"
              : "text-fluency-gray-800 dark:text-fluency-gray-50 hover:text-fluency-blue-500 dark:hover:text-white dark:hover:bg-fluency-blue-900 duration-150 ease-in-out transition-all rounded-md p-2 px-2 text-md"
          }
        >
          <AiOutlinePlus className="w-4 h-auto" />
        </motion.button>

        <button className="mr-1 block cursor-pointer text-fluency-gray-800 dark:text-fluency-gray-100 hover:text-fluency-gray-400 duration-150 transition-all ease-in-out bg-fluency-gray-200 dark:bg-fluency-blue-1000 rounded-md p-2 px-2 text-md">
          <FaArrowDown onClick={scrollToBottom} className="w-3 h-auto" />
        </button>
        <button className="block cursor-pointer text-fluency-gray-800 dark:text-fluency-gray-100 hover:text-fluency-gray-400 duration-150 transition-all ease-in-out bg-fluency-gray-200 dark:bg-fluency-blue-1000 rounded-md p-2 px-2 text-md">
          <FaArrowUp onClick={scrollToTop} className="w-3 h-auto" />
        </button>
      </div>
    </div>
  );
};

export default ToolbarMobile;
