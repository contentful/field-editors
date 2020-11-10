import * as React from 'react';
import { EntryCard } from '@contentful/forma-36-react-components';
import { ContentType, FieldExtensionSDK, NavigatorSlideInfo } from '../../types';
import { WrappedEntryCard, WrappedEntryCardProps } from './WrappedEntryCard';
import { LinkActionsProps, MissingEntityCard } from '../../components';
import { useEntities } from '../../common/EntityStore';
import { ReferenceEditorProps } from '../../common/ReferenceEditor';
import get from 'lodash/get';
import { CustomCardProps } from '../../common/customCardTypes';

export type EntryCardReferenceEditorProps = ReferenceEditorProps & {
  entryId: string;
  index?: number;
  allContentTypes: ContentType[];
  isDisabled: boolean;
  onRemove: () => void;
  cardDragHandle?: React.ReactElement;
  hasCardEditActions: boolean;
  onMoveTop?: () => void;
  onMoveBottom?: () => void;
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
  const { loadEntry, entries } = useEntities();

  React.useEffect(() => {
    loadEntry(props.entryId);
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
    const slide = await openEntry(props.sdk, get(entry, 'sys.id'), {
      bulkEditing: props.parameters.instance.bulkEditing,
      index: props.index,
    });
    props.onAction &&
      props.onAction({
        entity: 'Entry',
        type: 'edit',
        id: get(entry, 'sys.id'),
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
        id: get(entry, 'sys.id'),
        contentTypeId: get(entry, 'sys.contentType.sys.id'),
      });
  };

  React.useEffect(() => {
    if (entry) {
      props.onAction && props.onAction({ type: 'rendered', entity: 'Entry' });
    }
  }, [entry]);

  return React.useMemo(() => {
    if (entry === 'failed') {
      return (
        <MissingEntityCard
          entityType="Entry"
          isDisabled={props.isDisabled}
          onRemove={onRemoveEntry}
        />
      );
    }
    if (entry === undefined) {
      return <EntryCard size={size} loading />;
    }
    const sharedCardProps: CustomCardProps = {
      index: props.index,
      entry,
      entryUrl: props.getEntityUrl && props.getEntityUrl(entry.sys.id),
      contentType: props.allContentTypes.find(
        (contentType) => contentType.sys.id === entry.sys.contentType.sys.id
      ),
      isDisabled: props.isDisabled,
      size,
      localeCode: props.sdk.field.locale,
      defaultLocaleCode: props.sdk.locales.default,
      cardDragHandle: props.cardDragHandle,
      onEdit,
      onRemove: onRemoveEntry,
      onMoveTop: props.onMoveTop,
      onMoveBottom: props.onMoveBottom,
    };

    const { hasCardEditActions, sdk } = props;

    function renderDefaultCard(props?: CustomCardProps) {
      const builtinCardProps: WrappedEntryCardProps = {
        ...sharedCardProps,
        hasCardEditActions: hasCardEditActions,
        getAsset: sdk.space.getAsset,
        getEntityScheduledActions: sdk.space.getEntityScheduledActions,
        entry: sharedCardProps.entry!,
        ...props,
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
  }, [props, entityKey]);
}
