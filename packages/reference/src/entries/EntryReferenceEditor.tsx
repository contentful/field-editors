import * as React from 'react';
import deepEqual from 'deep-equal';
import { FieldConnector } from '@contentful/field-editor-shared';
import { EntriesProvider } from './EntryStore';
import { ViewType, FieldExtensionSDK, Action } from '../types';

export interface EntryReferenceEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  sdk: FieldExtensionSDK;

  viewType: ViewType;

  getEntryUrl?: (entryId: string) => string;

  onAction?: (action: Action) => void;

  parameters: {
    instance: {
      canCreateEntry: boolean;
    };
  };
}

export function EntryReferenceEditor<T>(
  props: EntryReferenceEditorProps & {
    children: FieldConnector<T>['props']['children'];
  }
) {
  return (
    <EntriesProvider sdk={props.sdk}>
      <FieldConnector<T>
        throttle={0}
        field={props.sdk.field}
        isInitiallyDisabled={props.isInitiallyDisabled}
        isEqualValues={(value1, value2) => {
          return deepEqual(value1, value2);
        }}>
        {props.children}
      </FieldConnector>
    </EntriesProvider>
  );
}

EntryReferenceEditor.defaultProps = {
  isInitiallyDisabled: true
};
