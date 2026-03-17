jest.mock('./dialogs/InsertLinkModalDialog', () => ({
  openInsertLinkDialog: jest.fn(),
}));

jest.mock('./dialogs/SpecialCharacterModalDialog', () => ({
  openInsertSpecialCharacter: jest.fn(),
}));

jest.mock('./dialogs/InsertTableModalDialog', () => ({
  openInsertTableDialog: jest.fn(),
}));

jest.mock('./dialogs/ZenModeModalDialog', () => ({
  openZenMode: jest.fn(),
}));

import { openInsertLinkDialog } from './dialogs/InsertLinkModalDialog';
import { openInsertTableDialog } from './dialogs/InsertTableModalDialog';
import { openInsertSpecialCharacter } from './dialogs/SpecialCharacterModalDialog';
import { openZenMode } from './dialogs/ZenModeModalDialog';
import { createMarkdownActions } from './MarkdownActions';

const mockedOpenInsertLinkDialog = openInsertLinkDialog as jest.Mock;
const mockedOpenInsertSpecialCharacter = openInsertSpecialCharacter as jest.Mock;
const mockedOpenInsertTableDialog = openInsertTableDialog as jest.Mock;
const mockedOpenZenMode = openZenMode as jest.Mock;

const createEditor = () => ({
  actions: {
    h1: jest.fn(),
    h2: jest.fn(),
    h3: jest.fn(),
    bold: jest.fn(),
    italic: jest.fn(),
    quote: jest.fn(),
    ol: jest.fn(),
    ul: jest.fn(),
    strike: jest.fn(),
    code: jest.fn(),
    hr: jest.fn(),
    indent: jest.fn(),
    dedent: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    link: jest.fn(),
    table: jest.fn(),
  },
  usePrimarySelection: jest.fn(),
  getSelectedText: jest.fn(),
  insert: jest.fn(),
  getContent: jest.fn(),
  setContent: jest.fn(),
  setCursor: jest.fn(),
  focus: jest.fn(),
});

const createSdk = () =>
  ({
    dialogs: {},
    locales: {
      default: 'en-US',
      fallbacks: {},
    },
    notifier: {
      success: jest.fn(),
    },
  }) as any;

describe('createMarkdownActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dispatches toolbar actions to the editor', () => {
    const editor = createEditor();
    const actions = createMarkdownActions({
      sdk: createSdk(),
      editor: editor as any,
      locale: 'en-US',
    });

    actions.headings.h2();
    actions.simple.bold();
    actions.simple.ul();
    actions.history.undo();

    expect(editor.actions.h2).toHaveBeenCalledTimes(1);
    expect(editor.actions.bold).toHaveBeenCalledTimes(1);
    expect(editor.actions.ul).toHaveBeenCalledTimes(1);
    expect(editor.actions.undo).toHaveBeenCalledTimes(1);
  });

  it('opens the link dialog with the selected text and inserts a titled link', async () => {
    const editor = createEditor();
    const sdk = createSdk();
    editor.getSelectedText.mockReturnValue('Contentful');
    mockedOpenInsertLinkDialog.mockResolvedValue({
      url: 'https://contentful.com',
      text: 'ignored',
      title: 'The best headless CMS',
    });

    const actions = createMarkdownActions({
      sdk,
      editor: editor as any,
      locale: 'en-US',
    });

    await actions.insertLink();

    expect(editor.usePrimarySelection).toHaveBeenCalledTimes(1);
    expect(mockedOpenInsertLinkDialog).toHaveBeenCalledWith(sdk.dialogs, {
      selectedText: 'Contentful',
    });
    expect(editor.actions.link).toHaveBeenCalledWith(
      'https://contentful.com',
      'Contentful',
      'The best headless CMS',
    );
  });

  it('falls back to dialog text when no editor selection exists', async () => {
    const editor = createEditor();
    editor.getSelectedText.mockReturnValue('');
    mockedOpenInsertLinkDialog.mockResolvedValue({
      url: 'https://contentful.com',
      text: 'Contentful',
      title: '',
    });

    const actions = createMarkdownActions({
      sdk: createSdk(),
      editor: editor as any,
      locale: 'en-US',
    });

    await actions.insertLink();

    expect(editor.actions.link).toHaveBeenCalledWith('https://contentful.com', 'Contentful', '');
  });

  it('inserts special characters and tables from dialog results', async () => {
    const editor = createEditor();
    mockedOpenInsertSpecialCharacter.mockResolvedValue('€');
    mockedOpenInsertTableDialog.mockResolvedValue({ rows: 2, cols: 3 });

    const actions = createMarkdownActions({
      sdk: createSdk(),
      editor: editor as any,
      locale: 'en-US',
    });

    await actions.insertSpecialCharacter();
    await actions.insertTable();

    expect(editor.insert).toHaveBeenCalledWith('€');
    expect(editor.actions.table).toHaveBeenCalledWith({ rows: 2, cols: 3 });
  });

  it('updates content and restores cursor when zen mode closes', async () => {
    const editor = createEditor();
    mockedOpenZenMode.mockResolvedValue({
      value: 'updated markdown',
      cursor: { line: 2, ch: 4 },
    });

    const actions = createMarkdownActions({
      sdk: createSdk(),
      editor: editor as any,
      locale: 'en-US',
    });

    await actions.openZenMode();

    expect(editor.setContent).toHaveBeenCalledWith('updated markdown');
    expect(editor.setCursor).toHaveBeenCalledWith({ line: 2, ch: 4 });
    expect(editor.focus).toHaveBeenCalledTimes(1);
  });
});
