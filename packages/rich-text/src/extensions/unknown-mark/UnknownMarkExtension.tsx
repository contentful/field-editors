import { Mark, mergeAttributes } from '@tiptap/core';

export interface UnknownMarkOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    unknown: {
      /**
       * Set a unknown mark
       */
      setUnknown: () => ReturnType;
      /**
       * Toggle a unknown mark
       */
      toggleUnknown: () => ReturnType;
      /**
       * Unset a unknown mark
       */
      unsetUnknown: () => ReturnType;
    };
  }
}

export const Unknown = Mark.create<UnknownMarkOptions>({
  name: 'unknown',

  addOptions() {
    return {
      HTMLAttributes: {
        style: 'color: red',
      },
    };
  },

  // parseHTML() {
  //   // dunno
  // },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setUnknown:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleUnknown:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetUnknown:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
