import { FieldExtensionSDK } from '@contentful/app-sdk';
import { createPlateEditor } from '@udecode/plate-core';
import { Editor } from 'slate';

import { getPlugins } from '../plugins';
import { RichTextTrackingActionHandler } from '../plugins/Tracking';
import { RichTextEditor, RichTextPlugin } from '../types';
import { randomId } from './randomId';

export const normalize = (editor: RichTextEditor) => {
  // TODO check this

  // @ts-ignore
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

  // TODO check this

  // @ts-ignore
  const editor = createPlateEditor<RichTextEditor>({
    id: randomId('editor'),
    editor: options.input,
    plugins: options.plugins || getPlugins(sdk, trackingHandler),
  });

  return {
    editor,
    // TODO check this

    // @ts-ignore
    normalize: () => normalize(editor),
  };
};
