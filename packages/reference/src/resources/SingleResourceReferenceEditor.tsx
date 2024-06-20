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
  }
) {
  const { dialogs, field } = props.sdk;
  const linkActionsProps = useResourceLinkActions({
    dialogs,
    field,
    apiUrl: props.apiUrl,
  });
  props.sdk.parameters.instance.isLocalePublishingEnabled =
    !!props.parameters.instance.isLocalePublishingEnabled;

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
