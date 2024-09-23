import { FieldAppSDK } from '@contentful/app-sdk';

import { normalize, createPlateEditor } from '../internal';
import { PlatePlugin } from '../internal/types';
import { getPlugins } from '../plugins';
import { RichTextTrackingActionHandler } from '../plugins/Tracking';
import { randomId } from './randomId';

export const createTestEditor = (options: {
  input?: any;
  sdk?: FieldAppSDK;
  trackingHandler?: RichTextTrackingActionHandler;
  plugins?: PlatePlugin[];
}) => {
  const trackingHandler: RichTextTrackingActionHandler = options.trackingHandler ?? jest.fn();

  const sdk: FieldAppSDK = options.sdk ?? ({ field: { validation: [] } } as any);

  const editor = createPlateEditor({
    id: randomId('editor'),
    editor: options.input,
    plugins: options.plugins || getPlugins(sdk, trackingHandler),
    normalizeInitialValue: false,
  });

  return {
    editor,
    normalize: () => normalize(editor),
  };
};
