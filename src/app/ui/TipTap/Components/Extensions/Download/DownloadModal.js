import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import FluencyButton from '@/app/ui/Components/Button/button';

const storage = getStorage();

const DownloadModal = ({ isOpen, onClose, editor }) => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');

  const handleFileUpload = async () => {
    if (!file) return;

    setUploading(true);
    const storageRef = ref(storage, `files/${file.name}-${Date.now()}`);

    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFileUrl(url);
      return url;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleInsert = async () => {
    const uploadedFileUrl = await handleFileUpload();

    if (uploadedFileUrl && editor) {
      editor.chain().focus().insertContent(
        `<file-snippet description="${description}" fileUrl="${uploadedFileUrl}" fileName="${file.name}"></file-snippet>`
      ).run();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen">
      <div className="fixed inset-0 transition-opacity">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>
      <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium mb-4">Download de arquivos</h3>
          <div className="flex flex-col gap-3">
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            {file && <p className="text-sm text-gray-700">Selecione o arquivo: {file.name}</p>}

            <textarea
              className="border rounded p-2 bg-gray-200 dark:bg-fluency-pages-dark"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description (optional)"
              rows={3}
            />

            <div className="flex gap-2 justify-end">
              <FluencyButton
                variant="confirm"
                onClick={handleInsert}
                disabled={uploading || !file}
              >
                {uploading ? 'Uploading...' : 'Inserir'}
              </FluencyButton>
              <FluencyButton variant="danger" onClick={onClose}>
                Cancelar
              </FluencyButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default DownloadModal;