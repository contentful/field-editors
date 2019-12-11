export type MarkdownTab = 'editor' | 'preview';

export type HeadingType = 'h1' | 'h2' | 'h3';

export type EditorDirection = 'ltr' | 'rtl';

export enum MarkdownDialogType {
  cheatsheet = 'cheatsheet'
}

export type MarkdownDialogsParams = {
  type: 'cheatsheet';
};

export type OpenMarkdownDialogParams<T> = {
  width?: number;
  position?: 'center' | 'top';
  title?: string;
  shouldCloseOnOverlayClick?: boolean;
  shouldCloseOnEscapePress?: boolean;
  parameters?: T;
};
