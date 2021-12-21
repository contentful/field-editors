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

  return createPlateEditor({
    editor: options.input,
    plugins: getPlugins(sdk, tracking),
  });
};
