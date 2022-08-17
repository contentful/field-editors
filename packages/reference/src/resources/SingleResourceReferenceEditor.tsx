import * as React from 'react';
import { FieldConnector } from '@contentful/field-editor-shared';
import deepEqual from 'deep-equal';

import { CombinedLinkActions } from '../components';
import { SingleEntryReferenceEditor } from '../entries';
import { ResourceLink } from '../types';
import { ResourceCard } from './Cards/ResourceCard';
import { useResourceLinkActions } from './useResourceLinkActions';
import { EntityProvider } from '../common/EntityStore';
import { EntryRoute } from './Cards/ContentfulEntryCard';

export function SingleResourceReferenceEditor(
  props: React.ComponentProps<typeof SingleEntryReferenceEditor> & {
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
        throttle={0}
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
            // TODO: support custom actions once publicly available
            <CombinedLinkActions {...linkActionsProps} />
          );
        }}
      </FieldConnector>
    </EntityProvider>
  );
}
