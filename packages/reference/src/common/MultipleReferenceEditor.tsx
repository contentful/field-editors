import * as React from 'react';
import arrayMove from 'array-move';
import { ReferenceValue, EntityType, ContentType } from '../types';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { ReferenceEditor, ReferenceEditorProps } from './ReferenceEditor';
import { LinkEntityActions } from '../components';
import { SortEndHandler, SortStartHandler } from 'react-sortable-hoc';

type ChildProps = {
  entityType: EntityType;
  items: ReferenceValue[];
  isDisabled: boolean;
  setValue: (value: ReferenceValue[]) => void;
  allContentTypes: ContentType[];
  onSortStart: SortStartHandler;
  onSortEnd: SortEndHandler;
};

class Editor extends React.Component<
  ReferenceEditorProps &
    Omit<ChildProps, 'onSortStart' | 'onSortEnd'> & {
      children: (props: ReferenceEditorProps & ChildProps) => React.ReactElement;
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
          linkType: this.props.entityType,
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
            linkType: this.props.entityType,
            id
          } as const
        };
      })
    ]);
  };

  render() {
    const validations = fromFieldValidations([
      ...this.props.sdk.field.validations,
      ...(this.props.sdk.field.items?.validations ?? [])
    ]);

    return (
      <>
        {this.props.children({
          ...this.props,
          onSortStart: this.onSortStart,
          onSortEnd: this.onSortEnd
        })}
        <LinkEntityActions
          entityType={this.props.entityType}
          allContentTypes={this.props.allContentTypes}
          validations={validations}
          sdk={this.props.sdk}
          isDisabled={this.props.isDisabled}
          multiple={true}
          canCreateEntity={this.props.parameters.instance.canCreateEntity ?? true}
          canLinkEntity={this.props.parameters.instance.canLinkEntity ?? true}
          onCreate={this.onCreate}
          onLink={this.onLink}
          onAction={this.props.onAction}
        />
      </>
    );
  }
}

export function MultipleReferenceEditor(
  props: ReferenceEditorProps & {
    entityType: EntityType;
    children: (props: ReferenceEditorProps & ChildProps) => React.ReactElement;
  }
) {
  const allContentTypes = props.sdk.space.getCachedContentTypes();

  return (
    <ReferenceEditor<ReferenceValue[]> {...props}>
      {({ value, disabled, setValue, externalReset }) => {
        const items = value || [];
        return (
          <Editor
            {...props}
            items={items}
            isDisabled={disabled}
            setValue={setValue}
            key={`${externalReset}-list`}
            allContentTypes={allContentTypes}
          />
        );
      }}
    </ReferenceEditor>
  );
}
