// components/DropdownMenuItem.tsx
import React from "react";

interface DropdownMenuItemProps {
  icon: React.ElementType;
  name: string;
  onClick: () => void;
  isDisabled: boolean;
  isActive?: boolean;
  tooltip: string;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  icon: Icon,
  name,
  onClick,
  isDisabled,
  isActive = false,
  tooltip,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      title={tooltip}
      className={`
        flex items-center gap-2 p-2 rounded-md text-sm text-left
        ${
          isActive
            ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        }
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        transition-colors duration-150 ease-in-out
      `}
    >
      <Icon size={16} />
      <span>{name}</span>
    </button>
  );
};

export default DropdownMenuItem;