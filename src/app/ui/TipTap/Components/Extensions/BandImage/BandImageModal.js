import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import FluencyButton from '@/app/ui/Components/Button/button';

const storage = getStorage();

const BandImageModal = ({ isOpen, onClose, editor }) => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [position, setPosition] = useState('left');
  const [size, setSize] = useState('100px');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [previewHeight, setPreviewHeight] = useState('auto');

  const handleImageUpload = async () => {
    if (!image) return;

    setUploading(true);
    const storageRef = ref(storage, `images/${image.name}-${Date.now()}`);

    try {
      await uploadBytes(storageRef, image);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleInsert = async () => {
    const imageUrl = await handleImageUpload();

    if (imageUrl && editor) {
      editor.chain().focus().insertContent(
        `<image-text-component imageUrl="${imageUrl}" text="${text}" position="${position}" size="${size}"></image-text-component>`
      ).run();
      onClose();
    }
  };

  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setImagePreview(URL.createObjectURL(file));
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
        <h3 className="text-lg font-medium mb-4">Upload Image and Add Text</h3>
          <div className="flex flex-col gap-3">
            <input type="file" onChange={handleImagePreview} />
            {imagePreview && (
              <div className="border p-2 rounded-lg">
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: size, height: previewHeight }}
                  onLoad={(e) => {
                    const { naturalWidth, naturalHeight } = e.target;
                    setPreviewHeight((parseInt(size) / naturalWidth) * naturalHeight + 'px');
                  }}
                />
              </div>
            )}
            <input
              className="border rounded p-2 bg-gray-200 dark:bg-fluency-pages-dark"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text (optional)"
            />
            <select
              className="border rounded p-2 bg-gray-200 dark:bg-fluency-pages-dark"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
            <input
              className="border rounded p-2 bg-gray-200 dark:bg-fluency-pages-dark"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="Image size (e.g., 100px)"
            />
            <div className="flex gap-2 justify-end">
              <FluencyButton
                variant="confirm"
                onClick={handleInsert}
                disabled={uploading || !image}
              >
                {uploading ? 'Uploading...' : 'Insert'}
              </FluencyButton>
              <FluencyButton variant="danger" onClick={onClose}>
                Cancel
              </FluencyButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

BandImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editor: PropTypes.object.isRequired,
};

export default BandImageModal;
