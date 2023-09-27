import { Mark, mergeAttributes } from '@tiptap/core';

export interface UnknownMarkOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    unknownMark: {
      /**
       * Set a unknown mark
       */
      setUnknownMark: () => ReturnType;
      /**
       * Toggle a unknown mark
       */
      toggleUnknownMark: () => ReturnType;
      /**
       * Unset a unknown mark
       */
      unsetUnknownMark: () => ReturnType;
    };
  }
}

export const UnknownMark = Mark.create<UnknownMarkOptions>({
  name: 'unknownMark',

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
      setUnknownMark:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleUnknownMark:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetUnknownMark:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
