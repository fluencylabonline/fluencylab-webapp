import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ExerciseComponent from './ExerciseComponent';

export default Node.create({
  name: 'exerciseComponent',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      sentence: {
        default: null,
      },
      answer: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'exercise-component',
        getAttrs: (element) => ({
          sentence: element.getAttribute('sentence'),
          answer: element.getAttribute('answer'),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['exercise-component', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ExerciseComponent);
  },
});
