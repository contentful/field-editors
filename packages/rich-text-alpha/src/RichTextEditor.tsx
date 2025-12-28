import * as React from 'react';

import type { FieldAppSDK } from '@contentful/app-sdk';
import { FieldConnector } from '@contentful/field-editor-shared';
import type { Document } from '@contentful/rich-text-types';

import { Doc } from './components';
import { isEmptyField } from './utils/isEmptyField';

export type RichTextProps = {
  sdk: FieldAppSDK;
  isInitiallyDisabled: boolean;
  minHeight?: string | number;
  maxHeight?: string | number;
  onAction?: (name: string, data: Record<string, unknown>) => void;
  isToolbarHidden?: boolean;
  stickyToolbarOffset?: number;
  withCharValidation?: boolean;

  /**
   * Extra components to be rendered inside the editor hence have access
   * to the editor state.
   *
   * For internal use only. e.g. dev tools integration.
   * @internal
   */
  extraChildren?: React.ReactNode;
};

export const RichTextEditor = (props: RichTextProps) => {
  const { sdk, isInitiallyDisabled } = props;

  return (
    <FieldConnector<Document>
      debounce={0}
      field={sdk.field}
      isInitiallyDisabled={isInitiallyDisabled}
      isEmptyValue={isEmptyField}
    >
      {({ lastRemoteValue, disabled }) => (
        <Doc
          sdk={sdk}
          isDisabled={disabled}
          value={lastRemoteValue}
          minHeight={props.minHeight}
          maxHeight={props.maxHeight}
          toolbar={{
            hidden: props.isToolbarHidden,
            stickyOffset: props.stickyToolbarOffset,
          }}
          extraChildren={props.extraChildren}
        />
      )}
    </FieldConnector>
  );
};
