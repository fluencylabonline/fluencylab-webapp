"use client";
import React from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Minus,
  Undo,
  Redo,
  CircleAlert,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { useMobile } from "@/app/hooks/use-mobile";

// Import the new specific toolbar components
import HighlightDropdown from "../../TipTap/Components/Toolbar/Dropdown/HighlightDropdown";
import ListDropdown from "../../TipTap/Components/Toolbar/Dropdown/ListDropdown";
import TableDropdown from "../../TipTap/Components/Toolbar/Dropdown/TableDropdown";
import TextAlignDropdown from "../../TipTap/Components/Toolbar/Dropdown/TextAlignDropdown";
import LinkComponent from "../../TipTap/Components/Toolbar/LinkComponent";
import ToolbarButton from "../../TipTap/Components/Toolbar/ToolbarButton";

interface ToolbarAulasProps {
  editor: Editor | null;
  onGoBack?: () => void;
  studentID: any;
  isTeacherNotebook: boolean
  isEditable: boolean
}

type ToolbarAulasButtonConfig = {
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

const ToolbarAulas: React.FC<ToolbarAulasProps> = ({ editor, onGoBack, studentID, isEditable, isTeacherNotebook}) => {
  const isMobile = useMobile();

  if (!editor) {
    return (
      <div className="fixed bottom-4 left-1/2 z-50 flex h-auto w-auto min-w-[200px] -translate-x-1/2 transform items-center justify-center rounded-xl bg-white px-4 py-3 text-center text-sm text-gray-600 shadow-xl ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
        Editor not available.
      </div>
    );
  }

  const toolbarButtons: ToolbarAulasButtonConfig[] = [
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
      customComponent: <ListDropdown editor={editor} placement={'top'}/>,
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
      customComponent: <LinkComponent editor={editor} placement={'top'} />,
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
      customComponent: <TableDropdown editor={editor} placement={'top'} />,
      icon: Pilcrow, // Placeholder icon
      tooltip: "Table Options",
    },
    {
      name: "textAlign",
      isCustomComponent: true,
      customComponent: <TextAlignDropdown editor={editor} placement={'top'} />,
      icon: Pilcrow, // Placeholder icon
      tooltip: "Text Alignment",
    },
    {
      name: "highlight",
      isCustomComponent: true,
      customComponent: <HighlightDropdown editor={editor} placement={'top'} />,
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
      fixed ${isMobile ? 'bottom-4' : 'bottom-4'} left-1/2 z-20
      -translate-x-1/2 transform
      rounded-xl px-3 py-2
      bg-white/20 dark:bg-black/50
      backdrop-blur-lg
      border border-white/30 dark:border-white/10
      text-fluency-gray-800 dark:text-fluency-gray-100
      hover:bg-white/30 hover:dark:bg-black/30
      hover:border-white/50 dark:hover:border-white/20
      focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent
      transition-all duration-300
      shadow-[0_4px_12px_rgba(0,0,0,0.05)]
    `}
  >
    <div
      className={`
        flex items-center gap-2
        ${
          isMobile
            ? "overflow-x-auto scrollbar-hide max-w-[90vw]"
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

export default ToolbarAulas;
