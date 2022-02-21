import { FieldExtensionSDK } from '@contentful/app-sdk';
import { createPlateEditor } from '@udecode/plate-core';
import { Editor } from 'slate';

import { getPlugins } from '../plugins';
import { RichTextTrackingActionHandler } from '../plugins/Tracking';
import { RichTextEditor, RichTextPlugin } from '../types';
import { randomId } from './randomId';

export const normalize = (editor: RichTextEditor) => {
  Editor.normalize(editor, { force: true });
};

export const createTestEditor = (options: {
  input?: any;
  sdk?: FieldExtensionSDK;
  trackingHandler?: RichTextTrackingActionHandler;
  plugins?: RichTextPlugin[];
}) => {
  const trackingHandler: RichTextTrackingActionHandler = options.trackingHandler ?? jest.fn();

  const sdk: FieldExtensionSDK = options.sdk ?? ({} as any);

  const editor = createPlateEditor({
    id: randomId('editor'),
    editor: options.input,
    plugins: options.plugins || getPlugins(sdk, trackingHandler),
  }) as RichTextEditor;

  return {
    editor,
    normalize: () => normalize(editor),
  };
};
