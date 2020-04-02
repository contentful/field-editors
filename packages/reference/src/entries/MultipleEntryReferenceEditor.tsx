import * as React from 'react';
import arrayMove from 'array-move';
import { EntryReferenceValue, ContentType } from '../types';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { ReferenceEditor, ReferenceEditorProps } from '../ReferenceEditor';
import { LinkEntityActions } from '../components';
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

  onCreate = (id: string) => {
    this.props.setValue([
      ...this.props.items,
      {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id
        }
      }
    ]);
  };

  onLink = (ids: string[]) => {
    this.props.setValue([
      ...this.props.items,
      ...ids.map(id => {
        return {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id
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
        <LinkEntityActions
          entityType="Entry"
          allContentTypes={this.props.allContentTypes}
          validations={validations}
          sdk={this.props.sdk}
          disabled={this.props.disabled}
          multiple={true}
          canCreateEntity={this.props.parameters.instance.canCreateEntity}
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
