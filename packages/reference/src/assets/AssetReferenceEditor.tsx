import * as React from 'react';
import deepEqual from 'deep-equal';
import { FieldConnector } from '@contentful/field-editor-shared';
import { EntityProvider } from '../EntityStore';
import { ViewType, FieldExtensionSDK, Action } from '../types';

export interface AssetReferenceEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  sdk: FieldExtensionSDK;

  viewType: ViewType;

  getAssetUrl?: (entryId: string) => string;

  onAction?: (action: Action) => void;

  parameters: {
    instance: {
      canCreateAsset: boolean;
    };
  };
}

export function AssetReferenceEditor<T>(
  props: AssetReferenceEditorProps & {
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

AssetReferenceEditor.defaultProps = {
  isInitiallyDisabled: true
};
