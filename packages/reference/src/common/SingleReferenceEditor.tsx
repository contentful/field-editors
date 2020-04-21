import * as React from 'react';
import { ReferenceValue, EntityType, ContentType } from '../types';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { LinkEntityActions } from '../components';
import { ReferenceEditor, ReferenceEditorProps } from './ReferenceEditor';

type ChildProps = {
  entityId: string;
  entityType: EntityType;
  isDisabled: boolean;
  setValue: (value: ReferenceValue | null | undefined) => void;
  allContentTypes: ContentType[];
};

class Editor extends React.Component<
  ReferenceEditorProps &
    ChildProps & {
      children: (props: ReferenceEditorProps & ChildProps) => React.ReactElement;
    }
> {
  onCreate = (id: string) => {
    this.props.setValue({
      sys: {
        type: 'Link',
        linkType: this.props.entityType,
        id
      }
    });
  };

  onLink = (ids: string[]) => {
    const [id] = ids;
    this.props.setValue({
      sys: {
        type: 'Link',
        linkType: this.props.entityType,
        id
      }
    });
  };

  render() {
    if (!this.props.entityId) {
      const validations = fromFieldValidations(this.props.sdk.field.validations);
      return (
        <LinkEntityActions
          entityType={this.props.entityType}
          allContentTypes={this.props.allContentTypes}
          validations={validations}
          sdk={this.props.sdk}
          isDisabled={this.props.isDisabled}
          multiple={false}
          canCreateEntity={this.props.parameters.instance.canCreateEntity}
          onCreate={this.onCreate}
          onLink={this.onLink}
          onAction={this.props.onAction}
        />
      );
    }

    return this.props.children({
      ...this.props,
      allContentTypes: this.props.allContentTypes,
      isDisabled: this.props.isDisabled,
      entityId: this.props.entityId,
      setValue: this.props.setValue
    });
  }
}

export function SingleReferenceEditor(
  props: ReferenceEditorProps & {
    entityType: EntityType;
    children: (props: ChildProps) => React.ReactElement;
  }
) {
  const allContentTypes = props.sdk.space.getCachedContentTypes();

  return (
    <ReferenceEditor<ReferenceValue> {...props}>
      {({ value, setValue, disabled, externalReset }) => {
        return (
          <Editor
            {...props}
            key={`${externalReset}-reference`}
            entityId={value ? value.sys.id : ''}
            isDisabled={disabled}
            setValue={setValue}
            allContentTypes={allContentTypes}
          />
        );
      }}
    </ReferenceEditor>
  );
}
