import * as React from 'react';
import { EntryReferenceValue } from '../types';
import { EntryReferenceEditor, EntryReferenceEditorProps } from './EntryReferenceEditor';

export function MultipleEntryReferenceEditor(props: EntryReferenceEditorProps) {
  React.useEffect(() => {
    props.onAction && props.onAction({ type: 'rendered', entity: 'Entry' });
  }, []);

  return (
    <EntryReferenceEditor<EntryReferenceValue[]> {...props}>
      {({ value }) => {
        console.log(value);
        return <div>not implemented</div>;
      }}
    </EntryReferenceEditor>
  );
}
