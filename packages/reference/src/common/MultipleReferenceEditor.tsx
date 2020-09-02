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

type EditorProps = ReferenceEditorProps &
  Omit<ChildProps, 'onSortStart' | 'onSortEnd'> & {
    children: (props: ReferenceEditorProps & ChildProps) => React.ReactElement;
  };

type EditorState = {
  canCreateEntity: boolean;
};

class Editor extends React.Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);
    this.state = {
      canCreateEntity: true,
    };
  }

  componentDidMount() {
    if (this.props.entityType === 'Asset') {
      this.props.sdk.access.can('create', 'Asset').then((value) => {
        this.setState({ canCreateEntity: value });
      });
    }
  }

  canCreateEntity = () => {
    if (this.props.parameters.instance.showCreateEntityAction === false) {
      return false;
    }
    return this.state.canCreateEntity;
  };

  canLinkEntity = () => {
    if (this.props.parameters.instance.showLinkEntityAction !== undefined) {
      return this.props.parameters.instance.showLinkEntityAction;
    }
    return true;
  };

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
          id,
        },
      },
    ]);
  };

  onLink = (ids: string[]) => {
    this.props.setValue([
      ...this.props.items,
      ...ids.map((id) => {
        return {
          sys: {
            type: 'Link',
            linkType: this.props.entityType,
            id,
          } as const,
        };
      }),
    ]);
  };

  render() {
    const validations = fromFieldValidations([
      ...this.props.sdk.field.validations,
      ...(this.props.sdk.field.items?.validations ?? []),
    ]);

    return (
      <>
        {this.props.children({
          ...this.props,
          onSortStart: this.onSortStart,
          onSortEnd: this.onSortEnd,
        })}
        <LinkEntityActions
          entityType={this.props.entityType}
          canLinkMultiple={true}
          allContentTypes={this.props.allContentTypes}
          validations={validations}
          sdk={this.props.sdk}
          isDisabled={this.props.isDisabled}
          canCreateEntity={this.canCreateEntity()}
          canLinkEntity={this.canLinkEntity()}
          onCreate={this.onCreate}
          onLink={this.onLink}
          onAction={this.props.onAction}
          renderCustomActions={this.props.renderCustomActions}
          actionLabels={this.props.actionLabels}
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

MultipleReferenceEditor.defaultProps = {
  hasCardEditActions: true,
};
