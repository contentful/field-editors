export type MarkdownTab = 'editor' | 'preview';

export type HeadingType = 'h1' | 'h2' | 'h3';

export type EditorDirection = 'ltr' | 'rtl';

export enum MarkdownDialogType {
  cheatsheet = 'cheatsheet',
  insertLink = 'insertLink'
}

export type MarkdownDialogsParams =
  | {
      type: MarkdownDialogType.cheatsheet;
    }
  | {
      type: MarkdownDialogType.insertLink;
      selectedText?: string;
    };

export type OpenMarkdownDialogParams<T = any> = {
  width?: number;
  position?: 'center' | 'top';
  title?: string;
  shouldCloseOnOverlayClick?: boolean;
  shouldCloseOnEscapePress?: boolean;
  parameters?: T;
};

export type MarkdownActions = {
  simple: {
    bold: Function;
    italic: Function;
    quote: Function;
    ol: Function;
    ul: Function;
    strike: Function;
    code: Function;
    hr: Function;
    indent: Function;
    dedent: Function;
  };
  headings: {
    h1: Function;
    h2: Function;
    h3: Function;
  };
  insertLink: Function;
  linkExistingMedia: Function;
};
