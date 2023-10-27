import * as React from 'react';

import { FieldConnector } from '@contentful/field-editor-shared';
import deepEqual from 'deep-equal';

import { EntityProvider } from '../common/EntityStore.js';
import { ReferenceEditorProps } from '../common/ReferenceEditor.js';
import { CombinedLinkEntityActions } from '../components/LinkActions/LinkEntityActions.js';
import { ResourceLink } from '../types.js';
import { EntryRoute } from './Cards/ContentfulEntryCard.js';
import { ResourceCard } from './Cards/ResourceCard.js';
import { useResourceLinkActions } from './useResourceLinkActions.js';

export function SingleResourceReferenceEditor(
  props: ReferenceEditorProps & {
    getEntryRouteHref: (entryRoute: EntryRoute) => string;
    apiUrl: string;
  }
) {
  const { dialogs, field } = props.sdk;
  const linkActionsProps = useResourceLinkActions({
    dialogs,
    field,
    apiUrl: props.apiUrl,
  });

  return (
    <EntityProvider sdk={props.sdk}>
      <FieldConnector<ResourceLink>
        debounce={0}
        field={props.sdk.field}
        isInitiallyDisabled={props.isInitiallyDisabled}
        isEqualValues={deepEqual}>
        {({ value, disabled }) => {
          return value ? (
            <ResourceCard
              onRemove={() => props.sdk.field.removeValue()}
              resourceLink={value}
              isDisabled={disabled}
              getEntryRouteHref={props.getEntryRouteHref}
            />
          ) : (
            <CombinedLinkEntityActions
              {...linkActionsProps}
              renderCustomActions={props.renderCustomActions}
            />
          );
        }}
      </FieldConnector>
    </EntityProvider>
  );
}
