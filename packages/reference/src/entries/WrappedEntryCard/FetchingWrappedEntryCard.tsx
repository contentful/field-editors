import * as React from 'react';
import { EntryCard } from '@contentful/forma-36-react-components';
import { ContentType, FieldExtensionSDK, NavigatorSlideInfo } from '../../types';
import { WrappedEntryCard } from './WrappedEntryCard';
import { MissingEntityCard } from '../../components';
import { useEntities } from '../../common/EntityStore';
import { ReferenceEditorProps } from '../../common/ReferenceEditor';

export type EntryCardReferenceEditorProps = ReferenceEditorProps & {
  entryId: string;
  index?: number;
  allContentTypes: ContentType[];
  isDisabled: boolean;
  onRemove: () => void;
  cardDragHandle?: React.ReactElement;
};

async function openEntry(
  sdk: FieldExtensionSDK,
  entryId: string,
  options: { bulkEditing?: boolean; index?: number }
) {
  let slide: NavigatorSlideInfo | undefined = undefined;

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

  React.useEffect(() => {
    if (entry) {
      props.onAction && props.onAction({ type: 'rendered', entity: 'Entry' });
    }
  }, [entry]);

  if (entry === 'failed') {
    return (
      <MissingEntityCard
        entityType="Entry"
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  if (entry === undefined) {
    return <EntryCard size={size} loading />;
  }

  return (
    <WrappedEntryCard
      getAsset={props.sdk.space.getAsset}
      getEntityScheduledActions={props.sdk.space.getEntityScheduledActions}
      getEntryUrl={props.getEntityUrl}
      isDisabled={props.isDisabled}
      size={size}
      localeCode={props.sdk.field.locale}
      defaultLocaleCode={props.sdk.locales.default}
      allContentTypes={props.allContentTypes}
      entry={entry}
      cardDragHandle={props.cardDragHandle}
      onEdit={async () => {
        const slide = await openEntry(props.sdk, entry.sys.id, {
          bulkEditing: props.parameters.instance.bulkEditing,
          index: props.index,
        });
        props.onAction &&
          props.onAction({
            entity: 'Entry',
            type: 'edit',
            id: entry.sys.id,
            contentTypeId: entry.sys.contentType.sys.id,
            slide,
          });
      }}
      onRemove={() => {
        props.onRemove();
        props.onAction &&
          props.onAction({
            entity: 'Entry',
            type: 'delete',
            id: entry.sys.id,
            contentTypeId: entry.sys.contentType.sys.id,
          });
      }}
    />
  );
}
