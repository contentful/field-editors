import * as React from 'react';
import deepEqual from 'deep-equal';
import { FieldConnector } from '@contentful/field-editor-shared';
import { EntityProvider } from './EntityStore';
import { ViewType, FieldExtensionSDK, Action } from '../types';

export interface ReferenceEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  sdk: FieldExtensionSDK;

  viewType: ViewType;

  getEntityUrl?: (entryId: string) => string;

  onAction?: (action: Action) => void;

  parameters: {
    instance: {
      canCreateEntity?: boolean;
      canLinkEntity?: boolean;
      bulkEditing?: boolean;
    };
  };
}

export function ReferenceEditor<T>(
  props: ReferenceEditorProps & {
    children: FieldConnector<T>['props']['children'];
  }
) {
  return (
    <EntityProvider sdk={props.sdk}>
      <FieldConnector<T>
        throttle={0}
        field={props.sdk.field}
        isInitiallyDisabled={props.isInitiallyDisabled}
        isEqualValues={(value1, value2) => {
          return deepEqual(value1, value2);
        }}>
        {props.children}
      </FieldConnector>
    </EntityProvider>
  );
}

ReferenceEditor.defaultProps = {
  isInitiallyDisabled: true
};
