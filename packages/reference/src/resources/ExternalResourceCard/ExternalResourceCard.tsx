import * as React from 'react';

import { EntryCard } from '@contentful/f36-components';

import { SysResourceLink } from '../../types';

interface Resource {
  sys: {
    type: 'Resource';
    id: string;
    resourceProvider: SysResourceLink<string>;
    resourceType: SysResourceLink<string>;
  };
  // the field values are Record<string, unknown> to apply localization if the provider supports it
  fields: {
    // maybe we need some mandatory fields that the search backend maps to from the original entity format,
    // this way we have specific fields that we can render in the search cards regardless of provider/resource type.
    title: string;
    description?: string;
    externalUrl?: string;
    image?: Record<string, unknown>; // object to handle eg accesibility
    additionalData: any; // should we keep it or not TBD
  };
}

export interface ExternalResourceCardProps {
  entity: Resource;
  isDisabled: boolean;
}

export function ExternalResourceCard(props: ExternalResourceCardProps) {
  return <EntryCard title={props.entity.fields.title} />;
}
