// components/toolbar/HighlightDropdown.tsx
import React from "react";
import { Editor } from "@tiptap/react";
import { X } from "lucide-react";
import Dropdown from "./Dropdown";
import ToolbarButton from "../ToolbarButton";
import { Highlighter } from "lucide-react"; // Import the Highlighter icon

interface HighlightDropdownProps {
  editor: Editor | null;
}

const HighlightDropdown: React.FC<HighlightDropdownProps> = ({ editor }) => {
  const highlighterColors = [
    {
      name: "Yellow",
      value: "#FFF0B380",
      className: "bg-[#FFF0B3] border border-gray-300 dark:border-gray-600",
    },
    {
      name: "Green",
      value: "#D9F7BE80",
      className: "bg-[#D9F7BE] border border-gray-300 dark:border-gray-600",
    },
    {
      name: "Blue",
      value: "#B3E6FF80",
      className: "bg-[#B3E6FF] border border-gray-300 dark:border-gray-600",
    },
    {
      name: "Red",
      value: "#FFB3B380",
      className: "bg-[#FFB3B3] border border-gray-300 dark:border-gray-600",
    },
    {
      name: "Remove Highlight",
      value: "unset",
      icon: X,
      className: "bg-transparent border border-gray-300 dark:border-gray-600",
    },
  ];

  const setHighlight = (color: string) => {
    if (editor) {
      editor.chain().focus().setMark("highlight", { color }).run();
    }
  };

  const dropdownContent = (
    <div className="flex flex-row p-3 gap-2 items-center justify-around">
      {highlighterColors.map((colorOption) => {
        const ColorIcon = colorOption.icon;
        return (
          <button
            key={colorOption.name}
            onClick={() => setHighlight(colorOption.value)}
            title={colorOption.name}
            className={`
              w-6 h-6 rounded-full flex items-center justify-center cursor-pointer
              ${colorOption.className}
              hover:scale-105 transition-transform duration-100 ease-in-out
            `}
          >
            {ColorIcon ? (
              <ColorIcon size={18} className="text-gray-500 dark:text-gray-400" />
            ) : null}
          </button>
        );
      })}
    </div>
  );

  return (
    <Dropdown content={dropdownContent} placement="bottom" align="center">
      <ToolbarButton
        icon={Highlighter}
        tooltip="Highlight Text"
        isActive={editor?.isActive("highlight") || false}
      />
    </Dropdown>
  );
};

export default HighlightDropdown;