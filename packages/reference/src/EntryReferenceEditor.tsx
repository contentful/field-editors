import * as React from 'react';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';
import { ViewType } from './types';
import { LinkActions } from './LinkActions/LinkActions';

export interface EntryReferenceEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  field: FieldAPI;

  viewType: ViewType;
}

export function EntryReferenceEditor(props: EntryReferenceEditorProps) {
  const { field } = props;

  return (
    <FieldConnector<string> field={field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {() => {
        return (
          <div>
            <LinkActions entityType="entry" multiple={false} canCreateEntity={true} />
          </div>
        );
      }}
    </FieldConnector>
  );
}

EntryReferenceEditor.defaultProps = {
  isInitiallyDisabled: true
};
