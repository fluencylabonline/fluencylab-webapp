import React from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import TeacherImage from '../../../../../../../public/images/apostila/teacher.png';

const TextTeacherComponent = ({ node }) => {
  const { text } = node.attrs;

  return (
    <NodeViewWrapper className="react-component">
      <div className='flex flex-row items-center justify-center bg-fluency-blue-100 dark:bg-fluency-gray-700 text-black dark:text-white w-full h-min rounded-3xl px-4'>
        <div className='w-full flex flex-row justify-between items-center'>
          <Image src={TeacherImage} alt="Teacher" className='w-[15%] h-auto' />
          <p className='p-7 text-md text-start w-full max-w-[95%] font-semibold'>{text}</p>
        </div>
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
};

// Define PropTypes
TextTeacherComponent.propTypes = {
  node: PropTypes.shape({
    attrs: PropTypes.shape({
      text: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default TextTeacherComponent;
