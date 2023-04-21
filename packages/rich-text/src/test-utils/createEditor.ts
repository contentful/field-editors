import { FieldExtensionSDK } from '@contentful/app-sdk';

import { createPlateEditor, normalize } from '../internal';
import { PlatePlugin } from '../internal/types';
import { getPlugins } from '../plugins';
import { RichTextTrackingActionHandler } from '../plugins/Tracking';
import { randomId } from './randomId';

export const createTestEditor = (options: {
  input?: any;
  sdk?: FieldExtensionSDK;
  trackingHandler?: RichTextTrackingActionHandler;
  plugins?: PlatePlugin[];
}) => {
  const trackingHandler: RichTextTrackingActionHandler = options.trackingHandler ?? jest.fn();

  const sdk: FieldExtensionSDK = options.sdk ?? ({ field: { validation: [] } } as any);

  const editor = createPlateEditor({
    id: randomId('editor'),
    editor: options.input,
    plugins: options.plugins || getPlugins(sdk, trackingHandler),
  });

  return {
    editor,
    normalize: () => normalize(editor),
  };
};
