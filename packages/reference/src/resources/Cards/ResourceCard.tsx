import * as React from 'react';

import { EntryCard } from '@contentful/f36-components';
import { CardActionsHandlers, ContentfulEntryCard, EntryRoute } from './ContentfulEntryCard';
import { RenderDragFn, ResourceLink } from '../../types';
import { UnsupportedEntityCard } from './UnsupportedEntityCard';
import { useInView } from 'react-intersection-observer';
import { useResource, isUnsupportedError } from '../../common/EntityStore';
import { SetRequired } from 'type-fest';
import { MissingEntityCard } from '../../components';

type ResourceCardProps = {
  index?: number;
  resourceLink?: ResourceLink;
  isDisabled: boolean;
  renderDragHandle?: RenderDragFn;
  getEntryRouteHref: (entryRoute: EntryRoute) => string;
} & CardActionsHandlers;

function ResourceCardSkeleton() {
  return <EntryCard size="small" isLoading />;
}

function ExistingResourceCard(
  props: SetRequired<ResourceCardProps, 'resourceLink'> & {
    inView: boolean;
  }
) {
  const { resourceLink, inView, index = 0 } = props;
  const resourceOptions = { priority: index * -1, enabled: inView };
  const { data, error } = useResource(
    resourceLink.sys.linkType,
    resourceLink.sys.urn,
    resourceOptions
  );
  if (!data && !error) {
    return <ResourceCardSkeleton />;
  }

  if (data) {
    return <ContentfulEntryCard info={data} {...props} />;
  }

  if (isUnsupportedError(error)) {
    return <UnsupportedEntityCard entityType={resourceLink.sys.linkType} />;
  }

  return (
    <MissingEntityCard entityType="Entry" isDisabled={props.isDisabled} onRemove={props.onRemove} />
  );
}

function ResourceCardWrapper(props: ResourceCardProps & { inView: boolean }) {
  if (!props.resourceLink) {
    return null;
  }

  return (
    <ExistingResourceCard
      {...props}
      resourceLink={props.resourceLink}
      getEntryRouteHref={props.getEntryRouteHref}
    />
  );
}

export function ResourceCard(props: ResourceCardProps) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '300px 0px 0px 300px' });

  // Forma does not offer us to pass refs, so we need an additional wrapper here
  return (
    <div ref={ref}>
      <ResourceCardWrapper {...props} inView={inView} />
    </div>
  );
}
