import * as React from 'react';

import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';
import isNumber from 'lodash/isNumber';

import { TagsEditor } from './TagsEditor';
import { ConstraintsType, Constraint } from './types';

export interface TagsEditorContainerProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;
  /**
   * sdk.field
   */
  field: FieldAPI;
}

type TagEditorValue = string[];

function isEmptyTagsValue(value: TagEditorValue | null) {
  return value === null || value.length === 0;
}

function getConstraintsType(sizeConstraints?: Constraint): ConstraintsType | undefined {
  if (!sizeConstraints) {
    return undefined;
  }
  if (isNumber(sizeConstraints.min) && isNumber(sizeConstraints.max)) {
    return 'min-max';
  } else if (isNumber(sizeConstraints.min)) {
    return 'min';
  } else if (isNumber(sizeConstraints.max)) {
    return 'max';
  } else {
    return undefined;
  }
}

export function TagsEditorContainer(props: TagsEditorContainerProps) {
  const field = props.field;

  const validations = field.validations || [];

  const sizeValidations = (validations as { size?: Constraint }[])
    .filter((validation) => validation.size)
    .map((validation) => validation.size);

  const constraints = sizeValidations.length > 0 ? sizeValidations[0] : {};

  const constraintsType = getConstraintsType(constraints);

  return (
    <FieldConnector<TagEditorValue>
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}
      isEmptyValue={isEmptyTagsValue}
      debounce={0}
    >
      {({ disabled, value, errors, setValue }) => {
        const items = value || [];
        return (
          <TagsEditor
            constraints={constraints}
            constraintsType={constraintsType}
            isDisabled={disabled}
            hasError={errors.length > 0}
            items={items}
            onUpdate={(items) => {
              setValue(items);
            }}
          />
        );
      }}
    </FieldConnector>
  );
}

TagsEditorContainer.defaultProps = {
  isInitiallyDisabled: true,
};
