'use client';
import FluencyButton from "@/app/ui/Components/Button/button";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";

interface FilterProps {
  filter: string | null;
  setFilter: (filter: string) => void;
}

export default function Filter({ filter, setFilter }: FilterProps) {
  return (
    <div>
      <Popover>
        <PopoverTrigger>
          <FluencyButton variant="confirm">Filtrar</FluencyButton>
        </PopoverTrigger>
        <PopoverContent>
          <ul className="bg-fluency-pages-light dark:bg-fluency-bg-dark p-3 rounded-md font-bold">
            <li
              onClick={() => setFilter("mensalidade")}
              className={`cursor-pointer p-2 rounded ${filter === "mensalidade" ? "bg-fluency-blue-500 text-white dark:text-white rounded-md" : "dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out transition-all"}`}
            >
              Ver só alunos
            </li>
            <li
              onClick={() => setFilter("professor")}
              className={`cursor-pointer p-2 rounded ${filter === "professor" ? "bg-fluency-blue-500 text-white dark:text-white rounded-md" : "dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out transition-all"}`}
            >
              Ver só professores
            </li>
            <li
              onClick={() => setFilter("despesa")}
              className={`cursor-pointer p-2 rounded ${filter === "despesa" ? "bg-fluency-blue-500 text-white dark:text-white rounded-md" : "dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out transition-all"}`}
            >
              Ver só gastos
            </li>
            <li
              onClick={() => setFilter("cancelamento")}
              className={`cursor-pointer p-2 rounded ${filter === "cancelamento" ? "bg-fluency-blue-500 text-white dark:text-white rounded-md" : "dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out transition-all"}`}
            >
              Ver só cancelamentos
            </li>
            <li
              onClick={() => setFilter("all")} // Clear filter
              className={`cursor-pointer p-2 rounded ${filter === "all" ? "bg-fluency-blue-500 text-white dark:text-white rounded-md" : "dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out transition-all"}`}
            >
              Sem filtros
            </li>
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
