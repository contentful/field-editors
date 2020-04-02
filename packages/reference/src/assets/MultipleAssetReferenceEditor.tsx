import * as React from 'react';
import arrayMove from 'array-move';
import { AssetReferenceValue, Entry } from '../types';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { ReferenceEditorProps, ReferenceEditor } from '../ReferenceEditor';
import { LinkAssetActions } from './LinkAssetActions';
import { SortableLinkList } from './SortableElements';
import { SortEndHandler, SortStartHandler } from 'react-sortable-hoc';

class Editor extends React.Component<
  ReferenceEditorProps & {
    items: AssetReferenceValue[];
    disabled: boolean;
    setValue: (value: AssetReferenceValue[]) => void;
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
          linkType: 'Asset',
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
            linkType: 'Asset',
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
          axis="xy"
          useDragHandle={true}
          // Fixes dragging in Firefox
          onSortStart={this.onSortStart}
          onSortEnd={this.onSortEnd}
        />
        <LinkAssetActions
          validations={validations}
          sdk={this.props.sdk}
          disabled={this.props.disabled}
          multiple={true}
          canCreateAsset={this.props.parameters.instance.canCreateEntity}
          onCreate={this.onCreate}
          onLink={this.onLink}
        />
      </>
    );
  }
}

export function MultipleAssetReferenceEditor(props: ReferenceEditorProps) {
  React.useEffect(() => {
    props.onAction && props.onAction({ type: 'rendered', entity: 'Entry' });
  }, []);

  return (
    <ReferenceEditor<AssetReferenceValue[]> {...props}>
      {({ value, disabled, setValue, externalReset }) => {
        const items = value || [];
        return (
          <Editor
            {...props}
            items={items}
            disabled={disabled}
            setValue={setValue}
            key={`${externalReset}-list`}
          />
        );
      }}
    </ReferenceEditor>
  );
}
