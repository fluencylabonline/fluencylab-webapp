// FlashcardExtension.js
import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import FlashcardComponent from './FlashcardComponent'

export default Node.create({
  name: 'flashcard',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      deckId: {
        default: null
      }
    }
  },

  parseHTML() {
    return [{
      tag: 'div[data-flashcard]',
      getAttrs: dom => ({
        deckId: dom.getAttribute('data-deck-id')
      })
    }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', {
      'data-flashcard': '',
      'data-deck-id': HTMLAttributes.deckId
    }]
  },

  addNodeView() {
    return ReactNodeViewRenderer(FlashcardComponent)
  }
})