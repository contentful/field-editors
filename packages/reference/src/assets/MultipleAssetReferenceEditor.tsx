import * as React from 'react';
import arrayMove from 'array-move';
import { AssetReferenceValue, ContentType } from '../types';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { ReferenceEditorProps, ReferenceEditor } from '../ReferenceEditor';
import { LinkEntityActions } from '../components';
import { SortableLinkList } from './SortableElements';
import { SortEndHandler, SortStartHandler } from 'react-sortable-hoc';

class Editor extends React.Component<
  ReferenceEditorProps & {
    items: AssetReferenceValue[];
    allContentTypes: ContentType[];
    disabled: boolean;
    setValue: (value: AssetReferenceValue[]) => void;
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
          linkType: 'Asset',
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
            linkType: 'Asset',
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
          axis="xy"
          useDragHandle={true}
          // Fixes dragging in Firefox
          onSortStart={this.onSortStart}
          onSortEnd={this.onSortEnd}
        />
        <LinkEntityActions
          entityType="Asset"
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

export function MultipleAssetReferenceEditor(props: ReferenceEditorProps) {
  const allContentTypes = props.sdk.space.getCachedContentTypes();

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
            allContentTypes={allContentTypes}
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
