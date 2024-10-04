import React, { useState, useEffect, useRef } from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import PropTypes from 'prop-types';
import { useSession } from 'next-auth/react';

const ExerciseComponent = ({ node }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const { sentence, answer } = node.attrs;
  const inputRef = useRef(null);

  useEffect(() => {
    setIsCorrect(userAnswer.trim().toLowerCase() === answer.trim().toLowerCase());
  }, [userAnswer, answer]);

  useEffect(() => {
    if (inputRef.current) {
      // Set the width of the input to fit the content
      inputRef.current.style.width = '2rem'; // Reset width to auto to measure the content
      inputRef.current.style.width = `${inputRef.current.scrollWidth}px`; // Set the width based on scrollWidth
    }
  }, [userAnswer]);

  const handleChange = (e) => {
    setUserAnswer(e.target.value);
  };

  const parts = sentence.split('{{gap}}');

  return (
    <NodeViewWrapper className="react-component">
      <div className="flex flex-col items-start w-full">
        <p className="mb-2">
          {parts[0]}
          <input
            type="text"
            ref={inputRef}
            className={`border-b-2 border-dotted outline-none focus:border-blue-500 ${isCorrect === true ? 'text-green-500 font-bold' : isCorrect === false ? 'text-red-500 font-bold' : 'text-black'}`}
            value={userAnswer}
            onChange={handleChange}
            style={{ width: 'auto', minWidth: '2rem' }} // Minimum width for readability
          />
          {parts[1]}
        </p>
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
};

// Define PropTypes
ExerciseComponent.propTypes = {
  node: PropTypes.shape({
    attrs: PropTypes.shape({
      sentence: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default ExerciseComponent;
