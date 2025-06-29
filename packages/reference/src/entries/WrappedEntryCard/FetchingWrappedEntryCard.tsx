import * as React from 'react';

import { EntryCard } from '@contentful/f36-components';
import {
  parseReleaseParams,
  useLocalePublishStatus,
  useActiveReleaseLocalesStatuses,
  getEntryReleaseStatus,
} from '@contentful/field-editor-shared';
import { EntryProps } from 'contentful-management';
import get from 'lodash/get';

import { CustomEntityCardProps, RenderCustomMissingEntityCard } from '../../common/customCardTypes';
import { useEntity, useEntityLoader } from '../../common/EntityStore';
import { ReferenceEditorProps } from '../../common/ReferenceEditor';
import type { LinkActionsProps } from '../../components';
import { MissingEntityCard } from '../../components';
import { ContentType, Entry, FieldAppSDK, NavigatorSlideInfo, RenderDragFn } from '../../types';
import { WrappedEntryCard, WrappedEntryCardProps } from './WrappedEntryCard';

export type EntryCardReferenceEditorProps = ReferenceEditorProps & {
  entryId: string;
  index?: number;
  allContentTypes: ContentType[];
  isDisabled: boolean;
  onRemove: () => void;
  renderDragHandle?: RenderDragFn;
  hasCardEditActions: boolean;
  onMoveTop?: () => void;
  onMoveBottom?: () => void;
  renderCustomMissingEntityCard?: RenderCustomMissingEntityCard;
  isBeingDragged?: boolean;
  activeLocales?: {
    code: string;
  }[];
};

async function openEntry(
  sdk: FieldAppSDK,
  entryId: string,
  options: { bulkEditing?: boolean; index?: number },
) {
  let slide: NavigatorSlideInfo | undefined;

  if (options.bulkEditing) {
    try {
      const result = await sdk.navigator.openBulkEditor(sdk.entry.getSys().id, {
        fieldId: sdk.field.id,
        locale: sdk.field.locale,
        index: options.index ?? 0,
      });
      slide = result.slide;
      return slide;
    } catch (e) {
      // we don't allow to open multiple bulk editors for performance reasons
      // proceed with a default openEntry
    }
  }

  const result = await sdk.navigator.openEntry(entryId, {
    slideIn: true,
  });
  slide = result.slide;

  return slide;
}

export function FetchingWrappedEntryCard(props: EntryCardReferenceEditorProps) {
  const { releaseVersionMap, locales, activeRelease, releases, isActiveReleaseLoading } =
    parseReleaseParams(props.sdk.parameters.instance.release);

  const { data: entry, status } = useEntity<Entry>('Entry', props.entryId);
  const { getEntityScheduledActions } = useEntityLoader();
  const loadEntityScheduledActions = React.useCallback(
    () => getEntityScheduledActions('Entry', props.entryId),
    [getEntityScheduledActions, props.entryId],
  );
  const localesStatusMap = useLocalePublishStatus(entry, props.sdk.locales);
  const { releaseLocalesStatusMap } = useActiveReleaseLocalesStatuses({
    currentEntryDraft: entry,
    entryId: props.entryId,
    releaseVersionMap,
    locales,
    activeRelease,
    releases,
  });
  const { releaseAction } = getEntryReleaseStatus(props.entryId, locales, activeRelease);

  const size = props.viewType === 'link' ? 'small' : 'default';
  const { getEntity } = useEntityLoader();
  const getAsset = (assetId: string) => getEntity('Asset', assetId);

  const onEdit = async () => {
    const slide = await openEntry(props.sdk, props.entryId, {
      bulkEditing: props.parameters.instance.bulkEditing,
      index: props.index,
    });
    props.onAction &&
      props.onAction({
        entity: 'Entry',
        type: 'edit',
        id: props.entryId,
        contentTypeId: get(entry, 'sys.contentType.sys.id'),
        slide,
      });
  };

  const onRemoveEntry = () => {
    props.onRemove();
    props.onAction &&
      props.onAction({
        entity: 'Entry',
        type: 'delete',
        id: props.entryId,
        contentTypeId: get(entry, 'sys.contentType.sys.id'),
      });
  };

  React.useEffect(() => {
    if (entry) {
      props.onAction && props.onAction({ type: 'rendered', entity: 'Entry' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, [entry]);

  return React.useMemo(() => {
    if (status === 'error') {
      const card = (
        <MissingEntityCard
          isDisabled={props.isDisabled}
          onRemove={onRemoveEntry}
          providerName="Contentful"
        />
      );
      if (props.renderCustomMissingEntityCard) {
        return props.renderCustomMissingEntityCard({
          defaultCard: card,
          entity: {
            id: props.entryId,
            type: 'Entry',
          },
        });
      }
      return card;
    }
    if (status === 'loading') {
      return <EntryCard size={size} isLoading />;
    }

    const sharedCardProps: CustomEntityCardProps = {
      index: props.index,
      entity: entry,
      entityUrl: props.getEntityUrl && props.getEntityUrl(entry.sys.id),
      contentType: props.allContentTypes.find(
        (contentType) => contentType.sys.id === entry.sys.contentType.sys.id,
      ),
      isDisabled: props.isDisabled,
      size,
      localeCode: props.sdk.field.locale,
      defaultLocaleCode: props.sdk.locales.default,
      renderDragHandle: props.renderDragHandle,
      onEdit,
      onRemove: onRemoveEntry,
      onMoveTop: props.onMoveTop,
      onMoveBottom: props.onMoveBottom,
      isBeingDragged: props.isBeingDragged,
      useLocalizedEntityStatus: props.sdk.parameters.instance.useLocalizedEntityStatus,
      localesStatusMap,
      activeLocales: props.activeLocales,
      releaseLocalesStatusMap,
      isReleasesLoading: isActiveReleaseLoading,
      activeRelease,
      releaseAction,
    };

    const { hasCardEditActions, hasCardMoveActions, hasCardRemoveActions } = props;

    function renderDefaultCard(props?: Partial<CustomEntityCardProps>) {
      const builtinCardProps: WrappedEntryCardProps = {
        ...sharedCardProps,
        ...props,
        hasCardEditActions,
        hasCardMoveActions,
        hasCardRemoveActions,
        getAsset,
        getEntityScheduledActions: loadEntityScheduledActions,
        entry: (props?.entity as EntryProps) || sharedCardProps.entity,
        entryUrl: props?.entityUrl || sharedCardProps.entityUrl,
      };

      return <WrappedEntryCard {...builtinCardProps} />;
    }

    if (props.renderCustomCard) {
      // LinkActionsProps are injected higher SingleReferenceEditor/MultipleReferenceEditor
      const renderedCustomCard = props.renderCustomCard(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, [props, status, entry]);
}
