import * as React from 'react';
import deepEqual from 'deep-equal';
import { FieldConnector } from '@contentful/field-editor-shared';
import { EntityProvider } from './EntityStore';
import { ViewType, FieldExtensionSDK, Action, Entry, ContentType, ActionLabels } from '../types';
import type { LinkActionsProps } from '../components';

// TODO: Rename common base for reference/media editors to something neutral,
//  e.g. `LinkEditor<T>`.

export interface ReferenceEditorProps {
  /**
   * Whether or not the field should be disabled initially.
   */
  isInitiallyDisabled: boolean;
  hasCardEditActions: boolean;
  sdk: FieldExtensionSDK;
  viewType: ViewType;
  renderCustomCard?: (
    props: CustomEntryCardProps,
    linkActionsProps: CustomActionProps
  ) => React.ReactElement | false;
  renderCustomActions?: (props: CustomActionProps) => React.ReactElement;
  getEntityUrl?: (entryId: string) => string;
  onAction?: (action: Action) => void;
  actionLabels?: Partial<ActionLabels>;
  parameters: {
    instance: {
      showCreateEntityAction?: boolean;
      showLinkEntityAction?: boolean;
      bulkEditing?: boolean;
    };
  };
}

export type CustomActionProps = LinkActionsProps;

// TODO: When making this available to media editor, consider introducing a
//  separate interface vs. making this more generic  using `entity` over `entry`
export type CustomEntryCardProps = {
  index?: number;
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
  hasCardEditActions: true,
};
