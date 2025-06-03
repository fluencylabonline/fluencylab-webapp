import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Pilcrow, // Using Pilcrow for Paragraph
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Minus, // For Horizontal Rule
  Undo,
  Redo,
} from 'lucide-react';

// Define the props for the toolbar component
interface FixedBottomToolbarProps {
  editor: Editor | null; // The TipTap editor instance
}

// Define a type for toolbar items for easier management
type ToolbarButtonConfig = {
  name: string;
  action: () => void;
  isActive?: () => boolean;
  canExecute?: () => boolean;
  icon: React.ElementType;
  tooltip: string;
};

const FixedBottomToolbar: React.FC<FixedBottomToolbarProps> = ({ editor }) => {
  // If the editor is not available, don't render the toolbar
  if (!editor) {
    return (
      <div className="fixed bottom-4 left-1/2 z-50 flex h-auto w-auto min-w-[200px] -translate-x-1/2 transform items-center justify-center rounded-xl bg-white px-4 py-3 text-center text-sm text-gray-600 shadow-xl ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
        Editor not available.
      </div>
    );
  }

  // Configuration for each toolbar button
  // This makes it easier to add or modify buttons in the future
  const toolbarButtons: ToolbarButtonConfig[] = [
    {
      name: 'bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
      canExecute: () => editor.can().chain().focus().toggleBold().run(),
      icon: Bold,
      tooltip: 'Bold (Ctrl+B)',
    },
    {
      name: 'italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
      canExecute: () => editor.can().chain().focus().toggleItalic().run(),
      icon: Italic,
      tooltip: 'Italic (Ctrl+I)',
    },
    {
      name: 'strike',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike'),
      canExecute: () => editor.can().chain().focus().toggleStrike().run(),
      icon: Strikethrough,
      tooltip: 'Strikethrough (Ctrl+Shift+X)',
    },
    {
      name: 'paragraph',
      action: () => editor.chain().focus().setParagraph().run(),
      isActive: () => editor.isActive('paragraph'),
      canExecute: () => editor.can().chain().focus().setParagraph().run(),
      icon: Pilcrow,
      tooltip: 'Paragraph',
    },
    {
      name: 'heading1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
      canExecute: () => editor.can().chain().focus().toggleHeading({ level: 1 }).run(),
      icon: Heading1,
      tooltip: 'Heading 1 (Ctrl+Alt+1)',
    },
    {
      name: 'heading2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
      canExecute: () => editor.can().chain().focus().toggleHeading({ level: 2 }).run(),
      icon: Heading2,
      tooltip: 'Heading 2 (Ctrl+Alt+2)',
    },
    {
      name: 'heading3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 }),
      canExecute: () => editor.can().chain().focus().toggleHeading({ level: 3 }).run(),
      icon: Heading3,
      tooltip: 'Heading 3 (Ctrl+Alt+3)',
    },
    {
      name: 'bulletList',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
      canExecute: () => editor.can().chain().focus().toggleBulletList().run(),
      icon: List,
      tooltip: 'Bullet List (Ctrl+Shift+8)',
    },
    {
      name: 'orderedList',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
      canExecute: () => editor.can().chain().focus().toggleOrderedList().run(),
      icon: ListOrdered,
      tooltip: 'Ordered List (Ctrl+Shift+7)',
    },
    {
      name: 'codeBlock',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
      canExecute: () => editor.can().chain().focus().toggleCodeBlock().run(),
      icon: Code,
      tooltip: 'Code Block (Ctrl+Alt+C)',
    },
    {
      name: 'blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
      canExecute: () => editor.can().chain().focus().toggleBlockquote().run(),
      icon: Quote,
      tooltip: 'Blockquote (Ctrl+Shift+B)',
    },
    {
      name: 'horizontalRule',
      action: () => editor.chain().focus().setHorizontalRule().run(),
      canExecute: () => editor.can().chain().focus().setHorizontalRule().run(),
      icon: Minus,
      tooltip: 'Horizontal Rule',
    },
    {
      name: 'undo',
      action: () => editor.chain().focus().undo().run(),
      canExecute: () => editor.can().chain().focus().undo().run(),
      icon: Undo,
      tooltip: 'Undo (Ctrl+Z)',
    },
    {
      name: 'redo',
      action: () => editor.chain().focus().redo().run(),
      canExecute: () => editor.can().chain().focus().redo().run(),
      icon: Redo,
      tooltip: 'Redo (Ctrl+Y)',
    },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex w-auto -translate-x-1/2 transform flex-wrap items-center justify-center gap-2 rounded-xl bg-white p-3 shadow-xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      {toolbarButtons.map((button) => {
        const IconComponent = button.icon;
        const isActive = button.isActive ? button.isActive() : false;
        const canExecute = button.canExecute ? button.canExecute() : true; // Assume can execute if not specified

        return (
          <button
            key={button.name}
            onClick={button.action}
            disabled={!canExecute}
            title={button.tooltip}
            className={`
              p-2 rounded-md
              ${isActive ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
              ${!canExecute ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              transition-colors duration-150 ease-in-out
            `}
          >
            <IconComponent size={18} />
          </button>
        );
      })}
    </div>
  );
};

export default FixedBottomToolbar;
