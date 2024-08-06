import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import TipComponent from './TipComponent';

export default Node.create({
  name: 'tipComponent',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      text: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'tip-component',
        getAttrs: (element) => ({
          text: element.getAttribute('text'),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['tip-component', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TipComponent);
  },
});

