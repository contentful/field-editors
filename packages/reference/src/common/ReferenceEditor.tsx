import * as React from 'react';
import deepEqual from 'deep-equal';
import { FieldConnector } from '@contentful/field-editor-shared';
import { EntityProvider } from './EntityStore';
import { Action, ActionLabels, FieldExtensionSDK, ViewType } from '../types';
import type { LinkActionsProps } from '../components';
import { CustomCardRenderer, RenderCustomMissingEntityCard } from './customCardTypes';

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
  renderCustomCard?: CustomCardRenderer;
  renderCustomActions?: (props: CustomActionProps) => React.ReactElement;
  renderCustomMissingEntityCard?: RenderCustomMissingEntityCard;
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
