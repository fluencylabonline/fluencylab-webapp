// Component to Render the Snippet
import React from 'react';
import PropTypes from 'prop-types';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { TbCloudDownload } from "react-icons/tb";

const FileSnippet = ({ node }) => {
  const { fileUrl, fileName, description } = node.attrs;

  return (
  <NodeViewWrapper className="react-component flex flex-col justify-center items-center">
    <div className="w-[75%] flex flex-row justify-around items-center border p-4 rounded-md bg-fluency-gray-100 text-center">
      <p className="text-md font-semibold">{description}</p>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        download={fileName}
        className="bg-fluency-blue-500 !text-white px-4 py-2 rounded hover:bg-fluency-blue-600 duration-300 ease-in-out transition-all"
      >
        <span className='flex flex-row items-center gap-2'>Baixar <TbCloudDownload /> </span>
      </a>
    </div>
    </NodeViewWrapper>
  );
};

FileSnippet.propTypes = {
  node: PropTypes.shape({
    attrs: PropTypes.shape({
      fileUrl: PropTypes.string.isRequired,
      fileName: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default FileSnippet;