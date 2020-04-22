export type MarkdownTab = 'editor' | 'preview';

export type HeadingType = 'h1' | 'h2' | 'h3';

export type EditorDirection = 'ltr' | 'rtl';

export enum MarkdownDialogType {
  cheatsheet = 'cheatsheet',
  insertLink = 'insertLink',
  insertSpecialCharacter = 'insertSpecialCharacter',
  insertTable = 'insertTable',
  embedExternalContent = 'embedExternalContent',
  confirmInsertAsset = 'confirmInsertAsset',
  zenMode = 'zenMode'
}

export type MarkdownDialogsParams =
  | {
      type: MarkdownDialogType.zenMode;
      initialValue: string;
      locale: string;
    }
  | {
      type: MarkdownDialogType.cheatsheet;
    }
  | {
      type: MarkdownDialogType.insertLink;
      selectedText?: string;
    }
  | {
      type: MarkdownDialogType.insertSpecialCharacter;
    }
  | {
      type: MarkdownDialogType.insertTable;
    }
  | {
      type: MarkdownDialogType.embedExternalContent;
    }
  | {
      type: MarkdownDialogType.confirmInsertAsset;
      locale: string;
      assets: Array<{
        title: string;
        description: string;
        thumbnailUrl: string;
        thumbnailAltText: string;
      }>;
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
  history: {
    undo: Function;
    redo: Function;
  };
  insertLink: Function;
  embedExternalContent: Function;
  insertTable: Function;
  insertSpecialCharacter: Function;
  linkExistingMedia: Function;
  addNewMedia: Function;
  organizeLinks: Function;
  openZenMode: Function;
  closeZenMode: Function;
};

export type PreviewComponents = {
  embedly?: React.Component<{ url: string }>;
};
