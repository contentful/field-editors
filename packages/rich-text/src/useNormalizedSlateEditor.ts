import { useMemo } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import { EMPTY_DOCUMENT } from '@contentful/rich-text-types';
import { createPlateEditor } from '@udecode/plate-core';
import { Transforms } from 'slate';

import schema from './constants/Schema';
import { disableCorePlugins, getPlugins } from './plugins';
import { useTrackingContext } from './TrackingProvider';

export type NormalizedSlateValueProps = {
  id: string;
  incomingDoc: unknown;
  sdk: FieldExtensionSDK;
};

export const useNormalizedSlateEditor = ({ id, sdk, incomingDoc }: NormalizedSlateValueProps) => {
  const tracking = useTrackingContext();

  return useMemo(() => {
    const editor = createPlateEditor({
      id,
      plugins: getPlugins(sdk, tracking),
      disableCorePlugins,
    });

    const doc = toSlatejsDocument({
      document: incomingDoc || EMPTY_DOCUMENT,
      schema,
    });

    // Sets editor value & kicks normalization
    Transforms.insertNodes(editor, doc);

    return editor;
  }, [id, sdk, tracking, incomingDoc]);
};
