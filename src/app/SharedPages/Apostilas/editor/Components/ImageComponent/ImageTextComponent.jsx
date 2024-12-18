import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import PropTypes from 'prop-types';
import Image from 'next/image';

const storage = getStorage();

const ImageTextComponent = ({ node }) => {
  const { imageUrl, text, position, size, height } = node.attrs;

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for enlarged image

  const getFlexDirection = () => {
    if (!text) return 'flex-col items-center';
    switch (position) {
      case 'left': return 'flex-row';
      case 'right': return 'flex-row-reverse';
      default: return 'flex-col';
    }
  };

  return (
    <NodeViewWrapper className="react-component">
      <div
        className={`flex items-start ${getFlexDirection()}`}
        style={{ width: size, height: height || 'auto' }}
      >
        {imageUrl && (
          <div
            style={{ width: size, height: size, cursor: 'pointer' }}
            className="relative"
            onClick={() => setIsModalOpen(true)}
          >
            <Image src={imageUrl} alt="Uploaded" layout="fill" objectFit="contain" />
          </div>
        )}
        {text && <p className="text-md font-medium w-[50%] text-justify">{text}</p>}
      </div>

      {/* Modal for enlarged image */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative p-4">
            <button
              className="absolute top-2 right-2 text-white text-3xl"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <img
              src={imageUrl}
              alt="Enlarged"
              className="max-w-full max-h-screen rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
      <NodeViewContent />
    </NodeViewWrapper>
  );
};

ImageTextComponent.propTypes = {
  node: PropTypes.shape({
    attrs: PropTypes.shape({
      imageUrl: PropTypes.string,
      text: PropTypes.string,
      position: PropTypes.oneOf(['left', 'right']).isRequired,
      size: PropTypes.string.isRequired,
      height: PropTypes.string, // New optional height attribute
    }).isRequired,
  }).isRequired,
};

export default ImageTextComponent;