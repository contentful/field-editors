import { createEditorPlugins } from '@udecode/plate';
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

  return createEditorPlugins({
    editor: options.input,
    plugins: getPlugins(sdk, tracking),
    // @ts-expect-error
    options: pluginOptions,
  });
};
