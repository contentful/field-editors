import * as React from 'react';

import { Entry } from '@contentful/field-editor-shared';

import { WrappedEntryCard } from '../../entries';
import { RenderDragFn, ResourceInfo } from '../../types';

export type CardActionsHandlers = {
  onRemove?: VoidFunction;
  onMoveTop?: VoidFunction;
  onMoveBottom?: VoidFunction;
};

export type EntryRoute = { spaceId: string; environmentId: string; entryId: string };

type ContentfulEntryCardProps = {
  info: ResourceInfo<Entry>;
  isDisabled: boolean;
  renderDragHandle?: RenderDragFn;
  getEntryRouteHref: (entryRoute: EntryRoute) => string;
} & CardActionsHandlers;

// assets are not shown for small cards (which we hardcode currently)
const resolveAsset = () => Promise.resolve();
// we don't want to show scheduled actions for resources
const resolveScheduledActions = () => Promise.resolve([]);

export function ContentfulEntryCard({
  info,
  isDisabled,
  renderDragHandle,
  onRemove,
  onMoveTop,
  onMoveBottom,
  getEntryRouteHref,
}: ContentfulEntryCardProps) {
  const resourceSys = info.resource.sys;
  const spaceId = resourceSys.space.sys.id;
  const environmentId = resourceSys.environment.sys.id;
  const entryId = resourceSys.id;

  const resourceHref = getEntryRouteHref({
    spaceId,
    environmentId,
    entryId,
  });

  // TODO: move this into `sdk.navigator.openEntry()`, note that it's signature only include the entry id (not a space or environment)
  const openEntryDetail = () => {
    window.open(resourceHref, '_blank', 'noopener,noreferrer');
  };

  return (
    <WrappedEntryCard
      entry={info.resource}
      isDisabled={isDisabled}
      hasCardEditActions={false}
      contentType={info.contentType}
      // we use the default locale from the space the entry belongs to
      // as we assume this gives a more consistent behaviour.
      // locales will inevitably differ from space to space, so it's likely
      // that the current locale does not exist in the "remote" space
      localeCode={info.defaultLocaleCode}
      defaultLocaleCode={info.defaultLocaleCode}
      size="small"
      getAsset={resolveAsset}
      getEntityScheduledActions={resolveScheduledActions}
      spaceName={info.space.name}
      renderDragHandle={renderDragHandle}
      isClickable={true}
      onEdit={openEntryDetail}
      hasCardRemoveActions={Boolean(onRemove)}
      onRemove={onRemove}
      onMoveBottom={onMoveBottom}
      onMoveTop={onMoveTop}
      entryUrl={resourceHref}
    />
  );
}
