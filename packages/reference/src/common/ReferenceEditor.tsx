import * as React from 'react';
import deepEqual from 'deep-equal';
import { FieldConnector } from '@contentful/field-editor-shared';
import { EntityProvider } from './EntityStore';
import { ViewType, FieldExtensionSDK, Action, Entry, ContentType } from '../types';

// TODO: Rename common base for reference/media editors to something neutral,
//  e.g. `LinkEditor<T>`.

export interface ReferenceEditorProps {
  /**
   * Whether or not the field should be disabled initially.
   */
  isInitiallyDisabled: boolean;
  sdk: FieldExtensionSDK;
  viewType: ViewType;
  renderCustomCard?: (props: CustomEntryCardProps) => React.ReactElement | false;
  getEntityUrl?: (entryId: string) => string;
  onAction?: (action: Action) => void;
  parameters: {
    instance: {
      showCreateEntityAction?: boolean;
      showLinkEntityAction?: boolean;
      bulkEditing?: boolean;
    };
  };
}

// TODO: When making this available to media editor, consider introducing a
//  separate interface vs. making this more generic  using `entity` over `entry`
export type CustomEntryCardProps = {
  entry: Entry;
  entryUrl?: string;
  contentType?: ContentType;
  localeCode: string;
  defaultLocaleCode: string;
  isDisabled: boolean;
  size: 'default' | 'small';
  cardDragHandle?: React.ReactElement;
  onEdit?: () => void;
  onRemove?: () => void;
};

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
  isInitiallyDisabled: true,
};
