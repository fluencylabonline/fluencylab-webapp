import React from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import StudentImage from '../../../../../../../public/images/apostila/student.png';

const TextStudentComponent = ({ node }) => {
  const { text } = node.attrs;

  return (
    <NodeViewWrapper className="react-component">
      <div className='flex flex-row items-center justify-center bg-fluency-gray-100 dark:bg-fluency-gray-700 text-black dark:text-white w-full h-min rounded-3xl px-4'>
        <div className='w-full flex flex-row justify-between items-center'>
          <p className='p-7 text-md w-full font-semibold'>{text}</p>
          <Image src={StudentImage} alt="Student" className='w-[15%] h-auto' />
        </div>
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
};

// Define PropTypes
TextStudentComponent.propTypes = {
  node: PropTypes.shape({
    attrs: PropTypes.shape({
      text: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default TextStudentComponent;
