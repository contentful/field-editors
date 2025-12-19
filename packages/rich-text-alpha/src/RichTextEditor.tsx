import * as React from 'react';

import type { FieldAppSDK } from '@contentful/app-sdk';
import { FieldConnector } from '@contentful/field-editor-shared';
import { Document, EMPTY_DOCUMENT } from '@contentful/rich-text-types';
import deepEquals from 'fast-deep-equal';

export type RichTextProps = {
  sdk: FieldAppSDK;
  isInitiallyDisabled: boolean;
  minHeight?: string | number;
  maxHeight?: string | number;
  value?: Document;
  isDisabled?: boolean;
  isToolbarHidden?: boolean;
  actionsDisabled?: boolean;
  withCharValidation?: boolean;
};

export const RichTextEditor = (props: RichTextProps) => {
  const { sdk, isInitiallyDisabled, isDisabled } = props;

  const isEmptyValue = React.useCallback(
    (value: unknown) => !value || deepEquals(value, EMPTY_DOCUMENT),
    [],
  );

  return (
    <FieldConnector
      debounce={0}
      field={sdk.field}
      isInitiallyDisabled={isInitiallyDisabled}
      isEmptyValue={isEmptyValue}
      isDisabled={isDisabled}
    >
      {() => <h1>Hello World</h1>}
    </FieldConnector>
  );
};
