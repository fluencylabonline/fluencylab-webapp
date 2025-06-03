// components/LinkComponent.tsx
"use client";
import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Link, RotateCcw, ExternalLink, Trash2 } from 'lucide-react';
import Dropdown from './Dropdown/Dropdown';

interface LinkComponentProps {
  editor: Editor | null;
  isMobile?: boolean;
}

const LinkComponent: React.FC<LinkComponentProps> = ({ editor, isMobile = false }) => {
  const [linkUrl, setLinkUrl] = useState('');

  if (!editor) return null;

  // Check if current selection has a link
  const isLinkActive = editor.isActive('link');
  const currentLink = isLinkActive ? editor.getAttributes('link').href : '';

  // Initialize input with current link when dropdown opens
  const handleDropdownOpen = (open: boolean) => {
    if (open) {
      setLinkUrl(currentLink || '');
    } else {
      setLinkUrl('');
    }
  };

  // Set link
  const setLink = () => {
    if (linkUrl.trim()) {
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // Remove link
  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  // Handle Enter key in input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setLink();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
    }
  };

  const dropdownContent = (
    <div className="p-3 min-w-[280px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Colar um link..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 border-none outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Reset/Clear button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLinkUrl('');
            }}
            title="Clear"
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
          >
            <RotateCcw size={14} />
          </button>
          
          {/* Open link button - only show if there's a valid URL */}
          {(linkUrl || currentLink) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const url = linkUrl || currentLink;
                const finalUrl = url.startsWith('http') ? url : `https://${url}`;
                window.open(finalUrl, '_blank');
              }}
              title="Open link"
              className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ExternalLink size={14} />
            </button>
          )}
          
          {/* Remove link button - only show if link is active */}
          {isLinkActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeLink();
              }}
              title="Remove link"
              className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        
        {/* Apply button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLink();
          }}
          disabled={!linkUrl.trim()}
          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors"
        >
          Aplicar
        </button>
      </div>
    </div>
  );

  return (
    <Dropdown
      content={dropdownContent}
      placement={isMobile ? 'top' : 'bottom'}
      align="center"
      contentClassName="min-w-0"
      onOpenChange={handleDropdownOpen}
    >
      <button
        title="Add Link (Ctrl+K)"
        className={`
          p-2 rounded-md flex-shrink-0
          ${isLinkActive ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
          cursor-pointer
          transition-colors duration-150 ease-in-out
        `}
      >
        <Link size={16} />
      </button>
    </Dropdown>
  );
};

export default LinkComponent;