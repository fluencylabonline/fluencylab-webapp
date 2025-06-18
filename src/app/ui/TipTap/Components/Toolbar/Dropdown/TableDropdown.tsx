// components/toolbar/TableDropdown.tsx
import React from "react";
import { Editor } from "@tiptap/react";
import {
  Table,
  Table2,
  Columns,
  Rows,
  Trash2,
  Merge,
  Split,
} from "lucide-react";
import Dropdown from "./Dropdown";
import ToolbarButton from "../ToolbarButton";
import DropdownMenuItem from "./DropdownMenuItem";

interface TableDropdownProps {
  editor: Editor | null;
  placement?: any;
}

const TableDropdown: React.FC<TableDropdownProps> = ({ editor, placement }) => {
  const tableOptions = [
    {
      name: "Inserir tabela",
      action: () =>
        editor
          ?.chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
      canExecute: () =>
        editor
          ?.can()
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run() || false,
      icon: Table2,
      tooltip: "Insert Table",
    },
    {
      name: "Add. Col. Antes",
      action: () => editor?.chain().focus().addColumnBefore().run(),
      canExecute: () =>
        editor?.can().chain().focus().addColumnBefore().run() || false,
      icon: Columns,
      tooltip: "Add Column Before",
    },
    {
      name: "Add. Col. Depois",
      action: () => editor?.chain().focus().addColumnAfter().run(),
      canExecute: () =>
        editor?.can().chain().focus().addColumnAfter().run() || false,
      icon: Columns,
      tooltip: "Add Column After",
    },
    {
      name: "Deletar coluna",
      action: () => editor?.chain().focus().deleteColumn().run(),
      canExecute: () =>
        editor?.can().chain().focus().deleteColumn().run() || false,
      icon: Columns,
      tooltip: "Delete Column",
    },
    {
      name: "Add. Lin. Antes",
      action: () => editor?.chain().focus().addRowBefore().run(),
      canExecute: () =>
        editor?.can().chain().focus().addRowBefore().run() || false,
      icon: Rows,
      tooltip: "Add Row Before",
    },
    {
      name: "Add. Lin. Depois",
      action: () => editor?.chain().focus().addRowAfter().run(),
      canExecute: () =>
        editor?.can().chain().focus().addRowAfter().run() || false,
      icon: Rows,
      tooltip: "Add Row After",
    },
    {
      name: "Deletar Linha",
      action: () => editor?.chain().focus().deleteRow().run(),
      canExecute: () =>
        editor?.can().chain().focus().deleteRow().run() || false,
      icon: Rows,
      tooltip: "Delete Row",
    },
    {
      name: "Juntar células",
      action: () => editor?.chain().focus().mergeCells().run(),
      canExecute: () =>
        editor?.can().chain().focus().mergeCells().run() || false,
      icon: Merge,
      tooltip: "Merge Cells",
    },
    {
      name: "Separar célula",
      action: () => editor?.chain().focus().splitCell().run(),
      canExecute: () =>
        editor?.can().chain().focus().splitCell().run() || false,
      icon: Split,
      tooltip: "Split Cell",
    },
    {
      name: "Deletar Tabela",
      action: () => editor?.chain().focus().deleteTable().run(),
      canExecute: () =>
        editor?.can().chain().focus().deleteTable().run() || false,
      icon: Trash2,
      tooltip: "Delete Table",
    },
  ];

  const dropdownContent = (
    <div className="flex flex-col p-2 min-w-[200px]">
      {tableOptions.map((option) => (
        <DropdownMenuItem
          key={option.name}
          name={option.name}
          icon={option.icon}
          onClick={option.action}
          isDisabled={!option.canExecute()}
          tooltip={option.tooltip}
        />
      ))}
    </div>
  );

  return (
    <Dropdown content={dropdownContent} placement={placement} align="center">
      <ToolbarButton icon={Table} tooltip="Table Options" />
    </Dropdown>
  );
};

export default TableDropdown;