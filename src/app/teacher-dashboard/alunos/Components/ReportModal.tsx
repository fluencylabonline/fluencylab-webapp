import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FluencyButton from "@/app/ui/Components/Button/button";
import { FileText } from "lucide-react";
import Notebook from "../aula/[aulaId]/page";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportContent: string;
  setReportContent: (content: string) => void;
  saveReport: () => void;
  studentName: string;
  isLoading?: boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportContent,
  setReportContent,
  saveReport,
  studentName,
  isLoading = false
}) => {

  const templates = [
    {
      name: "📚 Aula de Revisão",
      content: "- Revisão de conteúdo\n- Atividades práticas\n- Pronúncia"
    },
    {
      name: "🆕 Nova Matéria",
      content: "- Introdução novo tópico\n- Exercícios guiados\n- Dúvidas esclarecidas"
    },
    {
      name: "💬 Prática Oral",
      content: "- Conversação livre\n- Correção de erros\n- Expressões idiomáticas"
    }
  ];

  const handleTemplateClick = (content: string) => {
    setReportContent(reportContent + content);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-fluency-bg-light dark:bg-fluency-gray-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-fluency-blue-200 dark:border-fluency-gray-700"
            onClick={e => e.stopPropagation()}
          >
            {/* Modern Header */}
            <div className="bg-fluency-blue-500 dark:bg-fluency-blue-700 p-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-white" />
                  <h3 className="text-xl font-bold text-white">Relatório de Aula</h3>
                </div>
                <button 
                  onClick={onClose}
                  className="text-white hover:text-fluency-blue-100 text-2xl transition-colors"
                >
                  &times;
                </button>
              </div>
              <div className="mt-2 flex items-center text-fluency-blue-100">
                <span className="bg-fluency-blue-400 dark:bg-fluency-blue-600 px-2 py-1 rounded-md text-xs">
                  {studentName || "Aluno"}
                </span>
                <span className="mx-2">•</span>
                <span className="text-sm">
                  {new Date().toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-fluency-blue-800 dark:text-fluency-blue-200">
                  Conteúdo da Aula
                </label>
                <textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="Descreva detalhes da aula, pontos fortes, áreas de melhoria, comportamento do aluno..."
                  className="w-full min-h-[200px] p-4 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-xl bg-fluency-pages-light dark:bg-fluency-gray-800 text-fluency-text-light dark:text-fluency-text-dark focus:ring-2 focus:ring-fluency-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  maxLength={2000}
                />
                <div className="flex justify-between mt-2">
                  <div className="text-xs text-fluency-gray-500 dark:text-fluency-gray-400">
                    Dica: Seja objetivo e coloque os detalhes mais relevantes apenas.
                  </div>
                  <div className={`text-xs ${reportContent.length >= 1800 ? "text-fluency-orange-500" : "text-fluency-gray-500 dark:text-fluency-gray-400"}`}>
                    {reportContent.length}/2000 caracteres
                  </div>
                </div>
              </div>
              
              {/* Template Suggestions */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3 text-fluency-blue-800 dark:text-fluency-blue-200 flex items-center gap-2">
                  <span>Modelos Rápidos</span>
                  <span className="h-px flex-1 bg-fluency-gray-200 dark:bg-fluency-gray-700"></span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {templates.map((template, index) => (
                    <button 
                      key={index}
                      onClick={() => handleTemplateClick(template.content)}
                      className="text-xs bg-fluency-blue-50 dark:bg-fluency-gray-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-gray-700 p-3 rounded-lg border border-fluency-blue-200 dark:border-fluency-gray-600 transition-colors text-left"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Footer with Action Buttons */}
            <div className="bg-fluency-gray-100 dark:bg-fluency-gray-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-fluency-gray-200 dark:border-fluency-gray-700">
              <div className="text-sm text-fluency-gray-600 dark:text-fluency-gray-400">
                Este relatório será vinculado à lição
              </div>
              <div className="flex gap-3">
                <FluencyButton
                  variant="danger"
                  onClick={onClose}
                  className="px-5 py-2"
                  disabled={isLoading}
                >
                  Cancelar
                </FluencyButton>
                <FluencyButton
                  variant="confirm"
                  onClick={saveReport}
                  className="px-5 py-2"
                >
                  Salvar
                </FluencyButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;