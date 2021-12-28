import { Editor } from 'slate';
import { createPlateEditor, PlateEditor } from '@udecode/plate-core';
import { FieldExtensionSDK } from '@contentful/app-sdk';

import { getPlugins } from '../plugins';
import { TrackingProvider } from '../TrackingProvider';
import { RichTextPlugin } from '../types';
import { randomId } from './randomId';

const normalize = (editor: PlateEditor) => {
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

export const expectNormalized = (options: {
  input?: any;
  expected: any;
  editor?: PlateEditor;
  log?: boolean;
}) => {
  const editor =
    options.editor ??
    createTestEditor({
      input: options.input,
    }).editor;

  normalize(editor);

  if (options.log) {
    console.log(
      JSON.stringify(
        {
          expected: options.expected,
          actual: editor.children,
        },
        null,
        2
      )
    );
  }

  expect(editor.children).toEqual(options.expected.children);
};
