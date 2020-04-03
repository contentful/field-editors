import * as React from 'react';
import { EntryCard } from '@contentful/forma-36-react-components';
import { ContentType } from '../../types';
import { WrappedEntryCard } from './WrappedEntryCard';
import { MissingEntityCard } from '../../components';
import { useEntities } from '../../common/EntityStore';
import { ReferenceEditorProps } from '../../common/ReferenceEditor';

export type EntryCardReferenceEditorProps = ReferenceEditorProps & {
  entryId: string;
  allContentTypes: ContentType[];
  disabled: boolean;
  onRemove: () => void;
  cardDragHandle?: React.ReactElement;
};

export function FetchingWrappedEntryCard(props: EntryCardReferenceEditorProps) {
  const { loadEntry, entries } = useEntities();

  React.useEffect(() => {
    loadEntry(props.entryId);
  }, [props.entryId]);

  const size = props.viewType === 'link' ? 'small' : 'default';

  const entry = entries[props.entryId];

  if (entry === 'failed') {
    return (
      <MissingEntityCard entityType="Entry" disabled={props.disabled} onRemove={props.onRemove} />
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
      disabled={props.disabled}
      size={size}
      localeCode={props.sdk.field.locale}
      defaultLocaleCode={props.sdk.locales.default}
      allContentTypes={props.allContentTypes}
      entry={entry}
      cardDragHandle={props.cardDragHandle}
      onEdit={async () => {
        const { slide } = await props.sdk.navigator.openEntry(entry.sys.id, {
          slideIn: true
        });
        props.onAction &&
          props.onAction({
            entity: 'Entry',
            type: 'edit',
            id: entry.sys.id,
            contentTypeId: entry.sys.contentType.sys.id,
            slide
          });
      }}
      onRemove={() => {
        props.onRemove();
        props.onAction &&
          props.onAction({
            entity: 'Entry',
            type: 'delete',
            id: entry.sys.id,
            contentTypeId: entry.sys.contentType.sys.id
          });
      }}
    />
  );
}
