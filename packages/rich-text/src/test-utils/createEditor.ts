import { createEditor } from 'slate';
import { withPlate } from '@udecode/plate-core';
import { FieldExtensionSDK } from '@contentful/app-sdk';

import { getPlugins, pluginOptions } from '../plugins';
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

  const editor = createEditor() as any;

  return withPlate({
    editor: options.input,
    plugins: getPlugins(sdk, tracking),
    // @ts-expect-error
    options: pluginOptions,
  })(editor);
};
