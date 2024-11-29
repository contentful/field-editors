import * as React from 'react';

import { FieldConnector } from '@contentful/field-editor-shared';

import { EntityProvider } from '../common/EntityStore';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { useEditorPermissions } from '../common/useEditorPermissions';
import { CombinedLinkEntityActions } from '../components/LinkActions/LinkEntityActions';
import { ResourceLink } from '../types';
import { EntryRoute } from './Cards/ContentfulEntryCard';
import { ResourceCard } from './Cards/ResourceCard';
import { useResourceLinkActions } from './useResourceLinkActions';

export function SingleResourceReferenceEditor(
  props: ReferenceEditorProps & {
    getEntryRouteHref: (entryRoute: EntryRoute) => string;
    apiUrl: string;
  }
) {
  const { dialogs, field } = props.sdk;
  const allContentTypes = props.sdk.space.getCachedContentTypes();

  const editorPermissions = useEditorPermissions({
    ...props,
    allContentTypes,
    entityType: 'Entry',
  });

  const linkActionsProps = useResourceLinkActions({
    dialogs,
    editorPermissions,
    field,
    apiUrl: props.apiUrl,
  });

  return (
    <EntityProvider sdk={props.sdk}>
      <FieldConnector<ResourceLink<string>>
        debounce={0}
        field={props.sdk.field}
        isInitiallyDisabled={props.isInitiallyDisabled}
      >
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
