import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import FluencyButton from "@/app/ui/Components/Button/button";
import { Upload, FileText } from 'lucide-react';

interface CsvUploadProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadCSV: () => void;
  isUploading: boolean;
}

const CsvUpload: React.FC<CsvUploadProps> = ({
  handleFileChange,
  handleUploadCSV,
  isUploading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({
        target: { files: e.dataTransfer.files }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 mt-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Upload className="w-5 h-5 text-cyan-400" />
        <h4 className="text-lg font-semibold text-white">Upload de Cartões via CSV</h4>
      </div>
      
      <div 
        className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center mb-4 cursor-pointer transition-colors hover:border-cyan-500"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <FileText className="w-10 h-10 text-gray-400" />
          <p className="text-gray-400 mb-2">Arraste e solte seu arquivo CSV aqui</p>
          <p className="text-sm text-gray-500 mb-4">ou</p>
          <FluencyButton variant="glass" className="px-6">
            Selecionar Arquivo
          </FluencyButton>
        </div>
        
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
      </div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FluencyButton 
          onClick={handleUploadCSV} 
          disabled={isUploading}
          variant={isUploading ? "gray" : "purple"}
          className="w-full py-3 rounded-xl"
        >
          {isUploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
              Enviando...
            </div>
          ) : (
            <>
              <Upload className="mr-2" size={18} />
              Upload CSV
            </>
          )}
        </FluencyButton>
      </motion.div>
    </motion.div>
  );
};

export default CsvUpload;