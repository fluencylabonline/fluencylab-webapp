import React from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import ReviewIcon from '../../../../../../../public/images/apostila/review.png';

const ReviewComponent = ({ node }) => {
  const { title, content } = node.attrs;

  return (
    <NodeViewWrapper className="react-component">
      <div className="flex flex-col bg-fluency-blue-100 dark:bg-fluency-gray-700 text-black dark:text-white rounded-xl px-6 py-4">
        {/* Title and Icon */}
        <div className="flex items-center justify-center mb-4">
          <h2 className="text-2xl font-bold text-fluency-yellow">{title}</h2>
          <Image src={ReviewIcon} alt="Review Icon" className="w-12 h-12 ml-2" />
        </div>

        {/* Content */}
        <div className="text-md font-normal text-justify leading-relaxed">
          <p>{content}</p>
        </div>

        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
};

ReviewComponent.propTypes = {
  node: PropTypes.shape({
    attrs: PropTypes.shape({
      title: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default ReviewComponent;
