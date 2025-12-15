import * as React from 'react';

import { FieldConnector } from '@contentful/field-editor-shared';

import { EntityProvider } from '../common/EntityStore';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { CombinedLinkEntityActions } from '../components/LinkActions/LinkEntityActions';
import { ResourceLink } from '../types';
import { EntryRoute } from './Cards/ContentfulEntryCard';
import { ResourceCard } from './Cards/ResourceCard';
import { useResourceLinkActions } from './useResourceLinkActions';

export function SingleResourceReferenceEditor(
  props: ReferenceEditorProps & {
    getEntryRouteHref: (entryRoute: EntryRoute) => string;
    apiUrl: string;
  },
) {
  const linkActionsProps = useResourceLinkActions({
    sdk: props.sdk,
    parameters: props.parameters,
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
              locale={props.sdk.field.locale}
              referencingEntryId={props.sdk.ids.entry}
              isDisabled={disabled}
              getEntryRouteHref={props.getEntryRouteHref}
            />
          ) : (
            <CombinedLinkEntityActions
              {...linkActionsProps}
              renderCustomActions={props.renderCustomActions}
              isDisabled={disabled}
            />
          );
        }}
      </FieldConnector>
    </EntityProvider>
  );
}
