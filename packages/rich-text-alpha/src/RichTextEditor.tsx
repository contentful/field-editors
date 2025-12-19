import * as React from 'react';

import type { FieldAppSDK } from '@contentful/app-sdk';
import { FieldConnector } from '@contentful/field-editor-shared';
import type { Document } from '@contentful/rich-text-types';

import { isEmptyField } from './utils/isEmptyField';

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

  return (
    <FieldConnector
      debounce={0}
      field={sdk.field}
      isInitiallyDisabled={isInitiallyDisabled}
      isEmptyValue={isEmptyField}
      isDisabled={isDisabled}
    >
      {() => <h1>Hello World</h1>}
    </FieldConnector>
  );
};
