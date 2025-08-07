import * as React from 'react';

import { Text } from '@contentful/f36-components';
import { t } from '@lingui/core/macro';
import { css } from 'emotion';

import { Constraint, ConstraintsType } from './types';

interface TagEditorConstraintsProps {
  constraintsType: ConstraintsType;
  constraints: Constraint;
}

export function TagsEditorConstraints(props: TagEditorConstraintsProps) {
  const { constraintsType, constraints } = props;
  const min = constraints.min;
  const max = constraints.max;

  return (
    <Text
      as="p"
      fontColor="gray600"
      marginBottom="none"
      marginTop="spacingS"
      className={css({
        fontStyle: 'italic',
      })}
      testId="tag-editor-constraints"
    >
      {constraintsType === 'min' && (
        <span>
          {min === 1
            ? t({
                id: 'FieldEditors.Tags.TagsEditorConstraints.RequiresAtLeastOneTag',
                message: 'Requires at least 1 tag',
              })
            : t({
                id: 'FieldEditors.Tags.TagsEditorConstraints.RequiresAtLeastNTags',
                message: `Requires at least ${min} tags`,
              })}
        </span>
      )}
      {constraintsType === 'max' && (
        <span>
          {max === 1
            ? t({
                id: 'FieldEditors.Tags.TagsEditorConstraints.RequiresNoMoreThanOneTag',
                message: 'Requires no more than 1 tag',
              })
            : t({
                id: 'FieldEditors.Tags.TagsEditorConstraints.RequiresNoMoreThanNTags',
                message: `Requires no more than ${max} tags`,
              })}
        </span>
      )}
      {constraintsType === 'min-max' && max !== min && (
        <span>
          {t({
            id: 'FieldEditors.Tags.TagsEditorConstraints.RequiresBetweenNAndMTags',
            message: `Requires between ${min} and ${max} tags`,
          })}
        </span>
      )}
      {constraintsType === 'min-max' && max === min && (
        <span>
          {max === 1
            ? t({
                id: 'FieldEditors.Tags.TagsEditorConstraints.RequiresExactlyOneTag',
                message: 'Requires exactly 1 tag',
              })
            : t({
                id: 'FieldEditors.Tags.TagsEditorConstraints.RequiresExactlyNTags',
                message: `Requires exactly ${max} tags`,
              })}
        </span>
      )}
    </Text>
  );
}
