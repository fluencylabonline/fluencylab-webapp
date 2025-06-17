// components/ResponsiveToolbar.tsx
"use client";
import React from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Minus,
  Undo,
  Redo,
  ArrowLeft,
  CircleAlert,
  ArrowDown,
  ArrowUp,
  Video,
} from "lucide-react";
import { useMobile } from "@/app/hooks/use-mobile";
import LinkComponent from "./Components/Toolbar/LinkComponent";
import DarkModeToggle from "./Components/Toolbar/DarkModeToggle";
import { useRouter } from "next/navigation";

// Import the new specific toolbar components
import ToolbarButton from "./Components/Toolbar/ToolbarButton";
import HighlightDropdown from "./Components/Toolbar/Dropdown/HighlightDropdown";
import TextAlignDropdown from "./Components/Toolbar/Dropdown/TextAlignDropdown";
import ListDropdown from "./Components/Toolbar/Dropdown/ListDropdown";
import TableDropdown from "./Components/Toolbar/Dropdown/TableDropdown";
import Tools from "./Components/Tools";
import { FaTools } from "react-icons/fa";

interface ToolbarProps {
  editor: Editor | null;
  onGoBack?: () => void;
  studentID: any;
  isTeacherNotebook: boolean
  isEditable: boolean
}

type ToolbarButtonConfig = {
  name: string;
  action?: () => void;
  isActive?: () => boolean;
  canExecute?: () => boolean;
  icon: React.ElementType;
  tooltip: string;
  isCustomComponent?: boolean;
  customComponent?: React.ReactNode;
  alignRight?: boolean;
  alignLeft?: boolean;
};

const ResponsiveToolbar: React.FC<ToolbarProps> = ({ editor, onGoBack, studentID, isEditable, isTeacherNotebook}) => {
  const isMobile = useMobile();
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  if (!editor) {
    return (
      <div className="fixed bottom-4 left-1/2 z-50 flex h-auto w-auto min-w-[200px] -translate-x-1/2 transform items-center justify-center rounded-xl bg-white px-4 py-3 text-center text-sm text-gray-600 shadow-xl ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
        Editor not available.
      </div>
    );
  }

  const toolbarButtons: ToolbarButtonConfig[] = [
    {
      name: "goBack",
      action: handleGoBack,
      isActive: () => false,
      canExecute: () => true,
      icon: ArrowLeft,
      tooltip: "Go Back",
      alignLeft: true,
    },
    {
      name: "bold",
      action: () => editor?.chain().focus().toggleBold().run(),
      isActive: () => editor?.isActive("bold") || false,
      canExecute: () =>
        editor?.can().chain().focus().toggleBold().run() || false,
      icon: Bold,
      tooltip: "Bold (Ctrl+B)",
    },
    {
      name: "italic",
      action: () => editor?.chain().focus().toggleItalic().run(),
      isActive: () => editor?.isActive("italic") || false,
      canExecute: () =>
        editor?.can().chain().focus().toggleItalic().run() || false,
      icon: Italic,
      tooltip: "Italic (Ctrl+I)",
    },
    {
      name: "paragraph",
      action: () => editor?.chain().focus().setParagraph().run(),
      isActive: () => editor?.isActive("paragraph") || false,
      canExecute: () =>
        editor?.can().chain().focus().setParagraph().run() || false,
      icon: Pilcrow,
      tooltip: "Paragraph",
    },
    {
      name: "heading1",
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor?.isActive("heading", { level: 1 }) || false,
      canExecute: () =>
        editor?.can().chain().focus().toggleHeading({ level: 1 }).run() ||
        false,
      icon: Heading1,
      tooltip: "Heading 1 (Ctrl+Alt+1)",
    },
    {
      name: "heading2",
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor?.isActive("heading", { level: 2 }) || false,
      canExecute: () =>
        editor?.can().chain().focus().toggleHeading({ level: 2 }).run() ||
        false,
      icon: Heading2,
      tooltip: "Heading 2 (Ctrl+Alt+2)",
    },
    {
      name: "heading3",
      action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor?.isActive("heading", { level: 3 }) || false,
      canExecute: () =>
        editor?.can().chain().focus().toggleHeading({ level: 3 }).run() ||
        false,
      icon: Heading3,
      tooltip: "Heading 3 (Ctrl+Alt+3)",
    },
    {
      name: "listDropdown",
      isCustomComponent: true,
      customComponent: <ListDropdown editor={editor} />,
      icon: Pilcrow, // Placeholder icon, as it's a custom component
      tooltip: "Lists",
    },
    {
      name: "codeBlock",
      action: () => editor?.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor?.isActive("codeBlock") || false,
      canExecute: () =>
        editor?.can().chain().focus().toggleCodeBlock().run() || false,
      icon: CircleAlert,
      tooltip: "Attention Block",
    },
    {
      name: "code",
      action: () => editor?.chain().focus().toggleCode().run(),
      isActive: () => editor?.isActive("code") || false,
      canExecute: () =>
        editor?.can().chain().focus().toggleCode().run() || false,
      icon: Code,
      tooltip: "Inline Code (Ctrl+E)",
    },
    {
      name: "blockquote",
      action: () => editor?.chain().focus().toggleBlockquote().run(),
      isActive: () => editor?.isActive("blockquote") || false,
      canExecute: () =>
        editor?.can().chain().focus().toggleBlockquote().run() || false,
      icon: Quote,
      tooltip: "Blockquote (Ctrl+Shift+B)",
    },
    {
      name: "link",
      isCustomComponent: true,
      customComponent: <LinkComponent editor={editor} isMobile={isMobile} />,
      icon: Bold, // Placeholder icon
      tooltip: "Link",
    },
    {
      name: "horizontalRule",
      action: () => editor?.chain().focus().setHorizontalRule().run(),
      canExecute: () =>
        editor?.can().chain().focus().setHorizontalRule().run() || false,
      icon: Minus,
      tooltip: "Horizontal Rule",
    },
    {
      name: "tableDropdown",
      isCustomComponent: true,
      customComponent: <TableDropdown editor={editor} />,
      icon: Pilcrow, // Placeholder icon
      tooltip: "Table Options",
    },
    {
      name: "textAlign",
      isCustomComponent: true,
      customComponent: <TextAlignDropdown editor={editor} />,
      icon: Pilcrow, // Placeholder icon
      tooltip: "Text Alignment",
    },
    {
      name: "highlight",
      isCustomComponent: true,
      customComponent: <HighlightDropdown editor={editor} />,
      icon: Pilcrow, // Placeholder icon
      tooltip: "Highlight Text",
    },
    {
      name: "undo",
      action: () => editor?.chain().focus().undo().run(),
      canExecute: () => editor?.can().chain().focus().undo().run() || false,
      icon: Undo,
      tooltip: "Undo (Ctrl+Z)",
    },
    {
      name: "redo",
      action: () => editor?.chain().focus().redo().run(),
      canExecute: () => editor?.can().chain().focus().redo().run() || false,
      icon: Redo,
      tooltip: "Redo (Ctrl+Y)",
    },

    {
      name: "scrollUp",
      action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      icon: ArrowUp,
      tooltip: "Scroll to Top",
      alignRight: true,
      canExecute: () => true,
    },
    {
      name: "scrollDown",
      action: () =>
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        }),
      icon: ArrowDown,
      tooltip: "Scroll to Bottom",
      alignRight: true,
      canExecute: () => typeof window !== "undefined",
    },
    {
      name: "darkModeToggle",
      isCustomComponent: true,
      customComponent: <DarkModeToggle />,
      icon: Bold, // Placeholder icon
      tooltip: "Toggle Dark Mode",
      alignRight: true,
    },
    {
      name: "toolToggle",
      isCustomComponent: true,
      customComponent: <Tools isEditable={isEditable} isTeacherNotebook={isTeacherNotebook} editor={editor}/>,
      icon: FaTools, // Placeholder icon
      tooltip: "Ferramentas",
      alignRight: true,
    },
  ];

  const renderButtons = (alignment: "left" | "center" | "right") => {
    return toolbarButtons
      .filter((button) => {
        if (alignment === "left") return button.alignLeft;
        if (alignment === "right") return button.alignRight;
        return !button.alignLeft && !button.alignRight;
      })
      .map((button) => {
        if (button.isCustomComponent && button.customComponent) {
          return (
            <React.Fragment key={button.name}>
              {button.customComponent}
            </React.Fragment>
          );
        }
        return (
          <ToolbarButton
            key={button.name}
            icon={button.icon}
            onClick={button.action}
            isActive={button.isActive?.()}
            isDisabled={!button.canExecute?.()}
            tooltip={button.tooltip}
          />
        );
      });
  };

  return (
    <div
      className={`
        fixed z-50 w-full flex-shrink-0
        bg-tiptap-page-light py-1
        dark:bg-tiptap-page-dark
        border-b border-gray-200 dark:border-gray-700
        ${isMobile ? "bottom-0 left-0 right-0" : "top-0 left-0 right-0"}
      `}
    >
      <div
        className={`
          flex items-center gap-2
          ${
            isMobile
              ? "overflow-x-auto scrollbar-hide px-2"
              : "px-2 justify-between"
          }
        `}
      >

        {/* Far Left Buttons */}
        <div className="flex items-center gap-2">{renderButtons("left")}</div>

        {/* Center Group of Buttons */}
        <div className="flex items-center gap-2">{renderButtons("center")}</div>

        {/* Far Right Buttons */}
        <div className="flex items-center gap-2">{renderButtons("right")}</div>
        
      </div>
    </div>
  );
};

export default ResponsiveToolbar;
