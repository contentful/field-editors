import { Editor } from 'slate';
import { createPlateEditor } from '@udecode/plate-core';
import { FieldExtensionSDK } from '@contentful/app-sdk';

import { getPlugins } from '../plugins';
import { TrackingProvider } from '../TrackingProvider';

export const createTestEditor = (options: {
  input: any;
  sdk?: FieldExtensionSDK;
  tracking?: TrackingProvider;
}) => {
  const tracking: TrackingProvider = options.tracking ?? {
    onViewportAction: jest.fn(),
  };

  const sdk: FieldExtensionSDK = options.sdk ?? ({} as any);

  const editor = createPlateEditor({
    editor: options.input,
    plugins: getPlugins(sdk, tracking),
  });

  return {
    editor,
    normalize: () => Editor.normalize(editor, { force: true }),
  };
};

export const expectNormalized = (input: any, expected: any) => {
  const { editor, normalize } = createTestEditor({
    input,
  });

  normalize();

  expect(editor.children).toEqual(expected.children);
};
