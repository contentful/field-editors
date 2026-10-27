import * as React from 'react';

import { Entry } from '@contentful/field-editor-shared';

import { CustomCardRenderer, CustomEntityCardProps } from '../../common/customCardTypes';
import { LinkActionsProps } from '../../components';
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
  index?: number;
  isDisabled: boolean;
  renderDragHandle?: RenderDragFn;
  getEntryRouteHref: (entryRoute: EntryRoute) => string;
  renderCustomCard?: CustomCardRenderer;
} & CardActionsHandlers;

// assets are not shown for small cards (which we hardcode currently)
const resolveAsset = () => Promise.resolve();
// we don't want to show scheduled actions for resources
const resolveScheduledActions = () => Promise.resolve([]);

export function ContentfulEntryCard({
  info,
  index,
  isDisabled,
  renderDragHandle,
  onRemove,
  onMoveTop,
  onMoveBottom,
  getEntryRouteHref,
  renderCustomCard,
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

  const sharedCardProps: CustomEntityCardProps = {
    index,
    entity: info.resource,
    entityUrl: resourceHref,
    contentType: info.contentType,
    isDisabled,
    size: 'small',
    // we use the default locale from the space the entry belongs to
    // as we assume this gives a more consistent behaviour.
    // locales will inevitably differ from space to space, so it's likely
    // that the current locale does not exist in the "remote" space
    localeCode: info.defaultLocaleCode,
    defaultLocaleCode: info.defaultLocaleCode,
    renderDragHandle,
    onEdit: openEntryDetail,
    onRemove,
    onMoveTop,
    onMoveBottom,
  };

  function renderDefaultCard(props?: Partial<CustomEntityCardProps>) {
    const cardProps = { ...sharedCardProps, ...props };
    return (
      <WrappedEntryCard
        {...cardProps}
        entry={cardProps.entity as Entry}
        entryUrl={cardProps.entityUrl}
        hasCardEditActions={false}
        hasCardRemoveActions={Boolean(cardProps.onRemove)}
        getAsset={resolveAsset}
        getEntityScheduledActions={resolveScheduledActions}
        spaceName={info.space.name}
        isClickable={true}
      />
    );
  }

  if (renderCustomCard) {
    // LinkActionsProps are injected by the resource editors
    const renderedCustomCard = renderCustomCard(
      sharedCardProps,
      {} as LinkActionsProps,
      renderDefaultCard,
    );
    // Only `false` indicates to render the original card. E.g. `null` would result in no card.
    if (renderedCustomCard !== false) {
      return renderedCustomCard;
    }
  }

  return renderDefaultCard();
}
