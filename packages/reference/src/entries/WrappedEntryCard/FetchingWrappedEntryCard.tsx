import * as React from 'react';
import { EntryCard } from '@contentful/forma-36-react-components';
import { ContentType } from '../../types';
import { WrappedEntryCard } from './WrappedEntryCard';
import { MissingEntityCard } from '../../components';
import { useEntries } from '../EntryStore';
import { EntryReferenceEditorProps } from '../EntryReferenceEditor';

export type EntryCardReferenceEditorProps = EntryReferenceEditorProps & {
  entryId: string;
  allContentTypes: ContentType[];
  disabled: boolean;
  onRemove: () => void;
};

export function FetchingWrappedEntryCard(props: EntryCardReferenceEditorProps) {
  const { loadEntry, entries } = useEntries();

  React.useEffect(() => {
    loadEntry(props.entryId);
  }, [props.entryId]);

  React.useEffect(() => {
    const unsubscribe = props.sdk.navigator.onSlideInNavigation(
      ({ oldSlideLevel, newSlideLevel }) => {
        if (props.entryId) {
          if (oldSlideLevel > newSlideLevel) {
            loadEntry(props.entryId);
          }
        }
      }
    );
    return () => {
      unsubscribe();
    };
  }, [props.sdk, props.entryId]);

  const size = props.viewType === 'link' ? 'small' : 'default';

  const entry = entries[props.entryId];

  if (entry === 'failed') {
    return (
      <MissingEntityCard entityType="entry" disabled={props.disabled} onRemove={props.onRemove} />
    );
  }

  if (entry === undefined) {
    return <EntryCard size={size} loading />;
  }

  return (
    <WrappedEntryCard
      getAsset={props.sdk.space.getAsset}
      getEntityScheduledActions={props.sdk.space.getEntityScheduledActions}
      getEntryUrl={props.getEntryUrl}
      disabled={props.disabled}
      size={size}
      localeCode={props.sdk.field.locale}
      defaultLocaleCode={props.sdk.locales.default}
      allContentTypes={props.allContentTypes}
      entry={entry}
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
