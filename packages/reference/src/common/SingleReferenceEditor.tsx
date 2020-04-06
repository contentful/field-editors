import * as React from 'react';
import { ReferenceValue, EntityType, ContentType } from '../types';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { LinkEntityActions } from '../components';
import { ReferenceEditor, ReferenceEditorProps } from '../common/ReferenceEditor';

export function SingleReferenceEditor(
  props: ReferenceEditorProps & {
    entityType: EntityType;
    children: (props: {
      entityId: string;
      disabled: boolean;
      allContentTypes: ContentType[];
      externalReset: number;
      onRemove: () => void;
    }) => React.ReactElement;
  }
) {
  const allContentTypes = props.sdk.space.getCachedContentTypes();

  React.useEffect(() => {
    props.onAction && props.onAction({ type: 'rendered', entity: props.entityType });
  }, []);

  return (
    <ReferenceEditor<ReferenceValue> {...props}>
      {({ value, setValue, disabled, externalReset }) => {
        if (!value) {
          const validations = fromFieldValidations(props.sdk.field.validations);
          return (
            <LinkEntityActions
              entityType={props.entityType}
              allContentTypes={allContentTypes}
              validations={validations}
              sdk={props.sdk}
              disabled={disabled}
              multiple={false}
              canCreateEntity={props.parameters.instance.canCreateEntity}
              onCreate={id => {
                setValue({
                  sys: {
                    type: 'Link',
                    linkType: props.entityType,
                    id
                  }
                });
              }}
              onLink={([id]) => {
                setValue({
                  sys: {
                    type: 'Link',
                    linkType: props.entityType,
                    id
                  }
                });
              }}
            />
          );
        }

        return props.children({
          externalReset,
          allContentTypes,
          disabled,
          entityId: value.sys.id,
          onRemove: () => {
            setValue(null);
          }
        });
      }}
    </ReferenceEditor>
  );
}
