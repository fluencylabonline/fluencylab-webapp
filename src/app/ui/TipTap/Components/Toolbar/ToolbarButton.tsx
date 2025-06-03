// components/ToolbarButton.tsx
import React from "react";

interface ToolbarButtonProps {
  icon: React.ElementType;
  onClick?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  tooltip: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon: Icon,
  onClick,
  isActive = false,
  isDisabled = false,
  tooltip,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      title={tooltip}
      className={`
        p-2 rounded-md flex-shrink-0
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
    </button>
  );
};

export default ToolbarButton;