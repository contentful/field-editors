import * as React from 'react';

import {
  ExternalResourceCard,
  type ExternalResourceCardProps,
} from '../ExternalResourceCard/ExternalResourceCard';

type ExternalEntryCardProps = ExternalResourceCardProps;

export function ExternalEntryCard(props: ExternalEntryCardProps) {
  const openEntryDetail = () => {
    window.open(props.info.resource.fields.externalUrl, '_blank', 'noopener,noreferrer');
  };

  return <ExternalResourceCard {...props} onEdit={openEntryDetail} />;
}
