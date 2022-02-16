import { FieldExtensionSDK } from '@contentful/app-sdk';
import { createPlateEditor, PlateEditor } from '@udecode/plate-core';
import { Editor } from 'slate';

import { getPlugins } from '../plugins';
import { TrackingProvider } from '../TrackingProvider';
import { RichTextPlugin } from '../types';
import { randomId } from './randomId';

export const normalize = (editor: PlateEditor) => {
  Editor.normalize(editor, { force: true });
};

export const createTestEditor = (options: {
  input?: any;
  sdk?: FieldExtensionSDK;
  tracking?: TrackingProvider;
  plugins?: RichTextPlugin[];
}) => {
  const tracking: TrackingProvider = options.tracking ?? {
    onViewportAction: jest.fn(),
    onToolbarAction: jest.fn(),
    onCommandPaletteAction: jest.fn(),
    onShortcutAction: jest.fn(),
  };

  const sdk: FieldExtensionSDK = options.sdk ?? ({} as any);

  const editor = createPlateEditor({
    id: randomId('editor'),
    editor: options.input,
    plugins: options.plugins || getPlugins(sdk, tracking),
  });

  return {
    editor,
    normalize: () => normalize(editor),
  };
};
