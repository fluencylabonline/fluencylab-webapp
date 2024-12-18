// TipTap Node Definition
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FileSnippet from './FileSnippet';

export default Node.create({
  name: 'fileSnippet',

  group: 'block',
  atom: true,

  addAttributes() {
    return {
      fileUrl: {
        default: null,
      },
      fileName: {
        default: '',
      },
      description: {
        default: 'Baixe o arquivo aqui:',
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'file-snippet',
        getAttrs: (element) => ({
          fileUrl: element.getAttribute('fileUrl'),
          fileName: element.getAttribute('fileName'),
          description: element.getAttribute('description') || 'Baixe o arquivo aqui:',  // Default description
        }),
      },
    ];
  },
  

  renderHTML({ HTMLAttributes }) {
    return ['file-snippet', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileSnippet);
  },
});
