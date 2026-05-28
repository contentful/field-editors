import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

vi.mock('./dialogs/InsertLinkModalDialog', () => ({
  openInsertLinkDialog: vi.fn(),
}));

vi.mock('./dialogs/SpecialCharacterModalDialog', () => ({
  openInsertSpecialCharacter: vi.fn(),
}));

vi.mock('./dialogs/InsertTableModalDialog', () => ({
  openInsertTableDialog: vi.fn(),
}));

vi.mock('./dialogs/ZenModeModalDialog', () => ({
  openZenMode: vi.fn(),
}));

import { openInsertLinkDialog } from './dialogs/InsertLinkModalDialog';
import { openInsertTableDialog } from './dialogs/InsertTableModalDialog';
import { openInsertSpecialCharacter } from './dialogs/SpecialCharacterModalDialog';
import { openZenMode } from './dialogs/ZenModeModalDialog';
import { createMarkdownActions } from './MarkdownActions';

const mockedOpenInsertLinkDialog = openInsertLinkDialog as Mock;
const mockedOpenInsertSpecialCharacter = openInsertSpecialCharacter as Mock;
const mockedOpenInsertTableDialog = openInsertTableDialog as Mock;
const mockedOpenZenMode = openZenMode as Mock;

const createEditor = () => ({
  actions: {
    h1: vi.fn(),
    h2: vi.fn(),
    h3: vi.fn(),
    bold: vi.fn(),
    italic: vi.fn(),
    quote: vi.fn(),
    ol: vi.fn(),
    ul: vi.fn(),
    strike: vi.fn(),
    code: vi.fn(),
    hr: vi.fn(),
    indent: vi.fn(),
    dedent: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    link: vi.fn(),
    table: vi.fn(),
  },
  usePrimarySelection: vi.fn(),
  getSelectedText: vi.fn(),
  insert: vi.fn(),
  getContent: vi.fn(),
  setContent: vi.fn(),
  setCursor: vi.fn(),
  focus: vi.fn(),
});

const createSdk = () =>
  ({
    dialogs: {},
    locales: {
      default: 'en-US',
      fallbacks: {},
    },
    notifier: {
      success: vi.fn(),
    },
  }) as any;

describe('createMarkdownActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
