import React from "react";
import { Editor } from "@tiptap/react";
import {
  IndentDecrease,
  IndentIncrease,
  List,
  ListTodo,
} from "lucide-react";
import Dropdown from "./Dropdown";
import ToolbarButton from "../ToolbarButton";
import DropdownMenuItem from "./DropdownMenuItem";

interface ListDropdownProps {
  editor: Editor | null;
}

const ListDropdown: React.FC<ListDropdownProps> = ({ editor }) => {
  // Task List Options
  const taskListOptions = [
    {
      name: "Tarefa",
      action: () => editor?.chain().focus().toggleTaskList().run(),
      isActive: () => editor?.isActive("taskList") || false,
      canExecute: () => editor?.can().chain().focus().toggleTaskList().run() || false,
      icon: ListTodo,
      tooltip: "Task List",
    },
    {
      name: "Para direita",
      action: () => editor?.chain().focus().sinkListItem("taskItem").run(),
      isActive: () => false,
      canExecute: () => editor?.can().sinkListItem("taskItem") || false,
      icon: IndentIncrease,
      tooltip: "Increase Indent (Tab)",
    },
    {
      name: "Para esquerda",
      action: () => editor?.chain().focus().liftListItem("taskItem").run(),
      isActive: () => false,
      canExecute: () => editor?.can().liftListItem("taskItem") || false,
      icon: IndentDecrease,
      tooltip: "Decrease Indent (Shift+Tab)",
    },
  ];

  // Bullet List Options
  const bulletListOptions = [
    {
      name: "Lista",
      action: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: () => editor?.isActive("bulletList") || false,
      canExecute: () => editor?.can().chain().focus().toggleBulletList().run() || false,
      icon: List,
      tooltip: "Bullet List (Ctrl+Shift+8)",
    },
    {
      name: "Para direita",
      action: () => editor?.chain().focus().sinkListItem("listItem").run(),
      isActive: () => false,
      canExecute: () => editor?.can().sinkListItem("listItem") || false,
      icon: IndentIncrease,
      tooltip: "Increase Indent (Tab)",
    },
    {
      name: "Para esquerda",
      action: () => editor?.chain().focus().liftListItem("listItem").run(),
      isActive: () => false,
      canExecute: () => editor?.can().liftListItem("listItem") || false,
      icon: IndentDecrease,
      tooltip: "Decrease Indent (Shift+Tab)",
    },
  ];

  const renderDropdown = (options: typeof taskListOptions, icon: any, tooltip: string) => (
    <Dropdown
      content={
        <div className="flex flex-col p-2 min-w-[150px]">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.name}
              name={option.name}
              icon={option.icon}
              onClick={option.action}
              isDisabled={!option.canExecute()}
              isActive={option.isActive()}
              tooltip={option.tooltip}
            />
          ))}
        </div>
      }
      placement="bottom"
      align="center"
    >
      <ToolbarButton icon={icon} tooltip={tooltip} />
    </Dropdown>
  );

  return (
    <div className="flex gap-1">
      {renderDropdown(taskListOptions, ListTodo, "Task List Options")}
      {renderDropdown(bulletListOptions, List, "Bullet List Options")}
    </div>
  );
};

export default ListDropdown;
