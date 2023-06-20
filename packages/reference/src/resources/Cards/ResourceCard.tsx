import * as React from 'react';
import { useInView } from 'react-intersection-observer';

import { EntryCard } from '@contentful/f36-components';
import { SetRequired } from 'type-fest';

import { useResource } from '../../common/EntityStore';
import { ResourceEntityErrorCard } from '../../components';
import { RenderDragFn, ResourceLink } from '../../types';
import { CardActionsHandlers, ContentfulEntryCard, EntryRoute } from './ContentfulEntryCard';

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
    // @ts-expect-error
    return <ContentfulEntryCard info={data} {...props} />;
  }

  return (
    <ResourceEntityErrorCard
      linkType={resourceLink.sys.linkType}
      error={error}
      isDisabled={props.isDisabled}
      onRemove={props.onRemove}
    />
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
