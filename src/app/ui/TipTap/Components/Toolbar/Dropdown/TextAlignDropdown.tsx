// components/toolbar/TextAlignDropdown.tsx
import React from "react";
import { Editor } from "@tiptap/react";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import Dropdown from "./Dropdown";
import ToolbarButton from "../ToolbarButton";

interface TextAlignDropdownProps {
  editor: Editor | null;
  placement?: any;
}

const TextAlignDropdown: React.FC<TextAlignDropdownProps> = ({ editor, placement }) => {
  const textAlignOptions = [
    { name: "Left", value: "left", icon: AlignLeft },
    { name: "Center", value: "center", icon: AlignCenter },
    { name: "Right", value: "right", icon: AlignRight },
    { name: "Justify", value: "justify", icon: AlignJustify },
  ];

  const setTextAlign = (alignment: string) => {
    if (editor) {
      editor.chain().focus().setTextAlign(alignment).run();
    }
  };

  const currentAlignIcon = editor?.isActive({ textAlign: "left" })
    ? AlignLeft
    : editor?.isActive({ textAlign: "center" })
    ? AlignCenter
    : editor?.isActive({ textAlign: "right" })
    ? AlignRight
    : editor?.isActive({ textAlign: "justify" })
    ? AlignJustify
    : AlignLeft;

  const dropdownContent = (
    <div className="flex flex-row p-3 gap-2 items-center justify-around">
      {textAlignOptions.map((option) => {
        const AlignIcon = option.icon;
        const isOptionActive = editor?.isActive({ textAlign: option.value }) || false;
        return (
          <button
            key={option.name}
            onClick={() => setTextAlign(option.value)}
            title={option.name}
            className={`
              p-2 rounded-md flex-shrink-0
              ${
                isOptionActive
                  ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }
              cursor-pointer
              transition-colors duration-150 ease-in-out
            `}
          >
            <AlignIcon size={16} />
          </button>
        );
      })}
    </div>
  );

  return (
    <Dropdown content={dropdownContent} placement={placement} align="center">
      <ToolbarButton icon={currentAlignIcon} tooltip="Text Alignment" />
    </Dropdown>
  );
};

export default TextAlignDropdown;