import * as React from 'react';
import { EntryReferenceValue } from '../types';
import { EntryReferenceEditor, EntryReferenceEditorProps } from './EntryReferenceEditor';
import { FetchingWrappedEntryCard } from './WrappedEntryCard/FetchingWrappedEntryCard';

export function MultipleEntryReferenceEditor(props: EntryReferenceEditorProps) {
  const allContentTypes = props.sdk.space.getCachedContentTypes();

  React.useEffect(() => {
    props.onAction && props.onAction({ type: 'rendered', entity: 'Entry' });
  }, []);

  return (
    <EntryReferenceEditor<EntryReferenceValue[]> {...props}>
      {({ value, disabled, setValue }) => {
        const items = value || [];
        return (
          <>
            {items.map((item, index) => (
              <FetchingWrappedEntryCard
                {...props}
                key={`${item.sys.id}-${index}`}
                allContentTypes={allContentTypes}
                disabled={disabled}
                entryId={item.sys.id}
                onRemove={() => {
                  setValue(items.filter(filteringItem => filteringItem.sys.id !== item.sys.id));
                }}
              />
            ))}
          </>
        );
      }}
    </EntryReferenceEditor>
  );
}
