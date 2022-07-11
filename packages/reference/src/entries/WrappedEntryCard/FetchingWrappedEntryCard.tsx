import * as React from 'react';

import { EntryCard } from '@contentful/f36-components';
import get from 'lodash/get';

import { CustomEntityCardProps, RenderCustomMissingEntityCard } from '../../common/customCardTypes';
import { useEntities } from '../../common/EntityStore';
import { ReferenceEditorProps } from '../../common/ReferenceEditor';
import { MissingEntityCard } from '../../components';
import type { LinkActionsProps } from '../../components';
import { ContentType, FieldExtensionSDK, NavigatorSlideInfo, RenderDragFn } from '../../types';
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
};

async function openEntry(
  sdk: FieldExtensionSDK,
  entryId: string,
  options: { bulkEditing?: boolean; index?: number }
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
  const { getEntry, getAsset, loadEntityScheduledActions, entries } = useEntities();

  React.useEffect(() => {
    getEntry(props.entryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, [props.entryId]);

  const size = props.viewType === 'link' ? 'small' : 'default';
  const entry = entries[props.entryId];
  const entityKey =
    entry === 'failed'
      ? 'failed'
      : entry === undefined
      ? 'undefined'
      : `:${entry.sys.id}:${entry.sys.version}`;

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
    if (entry === 'failed') {
      const card = (
        <MissingEntityCard
          entityType="Entry"
          isDisabled={props.isDisabled}
          onRemove={onRemoveEntry}
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
    if (entry === undefined) {
      return <EntryCard size={size} isLoading />;
    }
    const sharedCardProps: CustomEntityCardProps = {
      index: props.index,
      entity: entry,
      entityUrl: props.getEntityUrl && props.getEntityUrl(entry.sys.id),
      contentType: props.allContentTypes.find(
        (contentType) => contentType.sys.id === entry.sys.contentType.sys.id
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
    };

    const { hasCardEditActions, hasCardMoveActions, hasCardRemoveActions } = props;

    function renderDefaultCard(props?: CustomEntityCardProps) {
      const builtinCardProps: WrappedEntryCardProps = {
        ...sharedCardProps,
        ...props,
        hasCardEditActions,
        hasCardMoveActions,
        hasCardRemoveActions,
        getAsset,
        getEntityScheduledActions: loadEntityScheduledActions,
        entry: props?.entity || sharedCardProps.entity,
        entryUrl: props?.entityUrl || sharedCardProps.entityUrl,
      };

      return <WrappedEntryCard {...builtinCardProps} />;
    }

    if (props.renderCustomCard) {
      // LinkActionsProps are injected higher SingleReferenceEditor/MultipleReferenceEditor
      const renderedCustomCard = props.renderCustomCard(
        sharedCardProps,
        {} as LinkActionsProps,
        renderDefaultCard
      );
      // Only `false` indicates to render the original card. E.g. `null` would result in no card.
      if (renderedCustomCard !== false) {
        return renderedCustomCard;
      }
    }

    return renderDefaultCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, [props, entityKey]);
}
