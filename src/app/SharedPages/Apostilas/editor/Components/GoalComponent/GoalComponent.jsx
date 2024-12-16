import React from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import GoalIcon from '../../../../../../../public/images/apostila/goal.png';

const GoalComponent = ({ node }) => {
  const { title, description, schedule } = node.attrs;

  // Split schedule into an array for easier rendering
  const scheduleItems = schedule ? schedule.split('\n') : [];

  return (
    <NodeViewWrapper className="react-component">
      <div className="flex flex-col bg-fluency-blue-100 dark:bg-fluency-gray-700 text-black dark:text-white rounded-xl px-6 py-4">
        {/* Title and Icon */}
        <div className="flex flex-row items-center justify-center mb-2">
          <h2 className="text-2xl font-bold text-fluency-yellow">{title}</h2>
          <Image src={GoalIcon} alt="Goal Icon" className="w-12 h-12 ml-2" />
        </div>

        {/* Description */}
        <div className='flex flex-row gap-2 justify-center items-center mb-4'>
          <p className='font-semibold text-fluency-yellow-500'>Objetivo:</p>
          <p className="text-md font-semibold">{description}</p>
        </div>

        {/* Weekly Schedule */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold flex flex-col justify-center items-center">Programação da semana:</h3>
          <ul className="list-none">
            {scheduleItems.map((item, index) => (
              <li key={index} className="mb-1">
                <strong>{item.split(' - ')[0]}</strong> - {item.split(' - ')[1]}
              </li>
            ))}
          </ul>
        </div>

        {/* Content from the editor */}
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
};

// Define PropTypes
GoalComponent.propTypes = {
  node: PropTypes.shape({
    attrs: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      schedule: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default GoalComponent;