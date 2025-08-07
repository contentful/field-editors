import * as React from 'react';

import { Text } from '@contentful/f36-components';
import { t, plural } from '@lingui/core/macro';
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
          {t({
            id: 'FieldEditors.Tags.TagsEditorConstraints.RequiresAtLeastNTags',
            message: plural(min || 0, {
              one: 'Requires at least # tag',
              other: 'Requires at least # tags',
            }),
          })}
        </span>
      )}
      {constraintsType === 'max' && (
        <span>
          {t({
            id: 'FieldEditors.Tags.TagsEditorConstraints.RequiresNoMoreThanNTags',
            message: plural(max || 0, {
              one: 'Requires no more than # tag',
              other: 'Requires no more than # tags',
            }),
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
          {t({
            id: 'FieldEditors.Tags.TagsEditorConstraints.RequiresExactlyNTags',
            message: plural(max || 0, {
              one: 'Requires exactly # tag',
              other: 'Requires exactly # tags',
            }),
          })}
        </span>
      )}
    </Text>
  );
}
