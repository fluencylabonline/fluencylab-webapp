import React, { forwardRef, useState, useCallback } from "react";
import clsx from "clsx";
import { FiUpload, FiX, FiCheck, FiLoader } from "react-icons/fi";

interface UploadOptions {
  /**
   * Upload component variant
   * @default "solid"
   */
  variant?: "solid" | "danger" | "warning" | "confirm";
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Accepted file types
   */
  accept?: string;
  /**
   * Callback when file is selected
   */
  onFileChange?: (file: File | null) => void;
  label?: string;
}

type Ref = HTMLInputElement;

export type UploadProps = React.InputHTMLAttributes<HTMLInputElement> &
  UploadOptions;

const getVariant = (variant: string) => {
  switch (variant) {
    case "danger":
      return "border-fluency-red-500 hover:border-fluency-red-600 bg-fluency-red-50 dark:bg-fluency-red-500/20";
    case "warning":
      return "border-fluency-orange-500 hover:border-fluency-orange-600 bg-fluency-orange-50 dark:bg-fluency-orange-500/20";
    case "confirm":
      return "border-fluency-green-500 hover:border-fluency-green-600 bg-fluency-green-50 dark:bg-fluency-green-500/20";
    default:
      return "border-fluency-gray-200 hover:border-fluency-blue-500 bg-fluency-gray-50 dark:bg-fluency-gray-800 dark:border-fluency-gray-700";
  }
};

const FluencyUpload = forwardRef<Ref, UploadProps>((props, ref) => {
  const {
    label,
    variant = "solid",
    placeholder = "Arraste arquivos ou clique para selecionar",
    accept,
    className,
    onFileChange,
    ...rest
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === "dragenter");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, []);

  const handleFile = (file: File) => {
    if (accept && !file.type.match(accept)) {
      setStatus("error");
      onFileChange?.(null);
      return;
    }

    setFile(file);
    onFileChange?.(file);
    setStatus("idle");

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setStatus("idle");
    onFileChange?.(null);
  };

  const baseClasses = clsx(
    "relative w-full min-h-[150px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all",
    getVariant(variant),
    isDragging
      ? "border-fluency-blue-500 bg-fluency-blue-50 dark:bg-fluency-blue-500/30"
      : "",
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark mb-2">
          {label}
        </label>
      )}
      <div
        className={baseClasses}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={ref}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          {...rest}
        />

        {!file ? (
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <FiUpload className="w-8 h-8 text-fluency-gray-500 dark:text-fluency-gray-300" />
            <p className="text-sm text-fluency-gray-600 dark:text-fluency-gray-300">
              {placeholder}
            </p>
          </div>
        ) : (
          <div className="w-full p-4">
            <div className="flex items-center gap-4">
              {preview && (
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-fluency-gray-200 dark:border-fluency-gray-600">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-fluency-gray-800 dark:text-fluency-gray-100">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-fluency-gray-400 hover:text-fluency-red-500 dark:text-fluency-gray-300"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-fluency-gray-500 dark:text-fluency-gray-400">
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>{file.type.split("/")[1]?.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {status !== "idle" && (
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-2 bg-fluency-gray-200 dark:bg-fluency-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-fluency-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {status === "uploading" && (
                  <FiLoader className="animate-spin text-fluency-blue-500 w-5 h-5" />
                )}
                {status === "success" && (
                  <FiCheck className="text-fluency-green-500 w-5 h-5" />
                )}
                {status === "error" && (
                  <FiX className="text-fluency-red-500 w-5 h-5" />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

FluencyUpload.displayName = "Upload";
export default FluencyUpload;
