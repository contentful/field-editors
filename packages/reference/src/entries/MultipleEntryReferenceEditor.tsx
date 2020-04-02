import * as React from 'react';
import arrayMove from 'array-move';
import { EntryReferenceValue, ContentType, Entry } from '../types';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { ReferenceEditor, ReferenceEditorProps } from '../ReferenceEditor';
import { LinkEntryActions } from './LinkEntryActions';
import { SortableLinkList } from './SortableElements';
import { SortEndHandler, SortStartHandler } from 'react-sortable-hoc';

class Editor extends React.Component<
  ReferenceEditorProps & {
    items: EntryReferenceValue[];
    disabled: boolean;
    setValue: (value: EntryReferenceValue[]) => void;
    allContentTypes: ContentType[];
  }
> {
  onSortStart: SortStartHandler = (_, event) => event.preventDefault();

  onSortEnd: SortEndHandler = ({ oldIndex, newIndex }) => {
    const newItems = arrayMove(this.props.items, oldIndex, newIndex);
    this.props.setValue(newItems);
  };

  onCreate = (entry: Entry) => {
    this.props.setValue([
      ...this.props.items,
      {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: entry.sys.id
        }
      }
    ]);
  };

  onLink = (entries: Entry[]) => {
    this.props.setValue([
      ...this.props.items,
      ...entries.map(entry => {
        return {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: entry.sys.id
          } as const
        };
      })
    ]);
  };

  render() {
    const validations = fromFieldValidations(this.props.sdk.field.validations);

    return (
      <>
        <SortableLinkList
          {...this.props}
          axis="y"
          useDragHandle={true}
          // Fixes dragging in Firefox
          onSortStart={this.onSortStart}
          onSortEnd={this.onSortEnd}
        />
        <LinkEntryActions
          allContentTypes={this.props.allContentTypes}
          validations={validations}
          sdk={this.props.sdk}
          disabled={this.props.disabled}
          multiple={true}
          canCreateEntry={this.props.parameters.instance.canCreateEntity}
          onCreate={this.onCreate}
          onLink={this.onLink}
        />
      </>
    );
  }
}

export function MultipleEntryReferenceEditor(props: ReferenceEditorProps) {
  const allContentTypes = props.sdk.space.getCachedContentTypes();

  React.useEffect(() => {
    props.onAction && props.onAction({ type: 'rendered', entity: 'Entry' });
  }, []);

  return (
    <ReferenceEditor<EntryReferenceValue[]> {...props}>
      {({ value, disabled, setValue, externalReset }) => {
        const items = value || [];
        return (
          <Editor
            {...props}
            items={items}
            disabled={disabled}
            setValue={setValue}
            key={`${externalReset}-list`}
            allContentTypes={allContentTypes}
          />
        );
      }}
    </ReferenceEditor>
  );
}
