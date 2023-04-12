import { FieldExtensionSDK } from '@contentful/app-sdk';
// TODO move this to internal
import { createPlateEditor } from '@udecode/plate-common';

import { normalize } from '../internal';
import { PlateEditor, PlatePlugin, Value } from '../internal/types';
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

  const editor = createPlateEditor<Value, PlateEditor>({
    id: randomId('editor'),
    editor: options.input,
    // @ts-expect-error
    plugins: options.plugins || getPlugins(sdk, trackingHandler),
  });

  return {
    editor,
    normalize: () => normalize(editor),
  };
};
