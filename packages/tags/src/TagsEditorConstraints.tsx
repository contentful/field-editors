import * as React from 'react';

import { Text } from '@contentful/f36-components';
import { css } from 'emotion';

import { Constraint, ConstraintsType } from './types';

interface TagEditorConstraintsProps {
  constraintsType: ConstraintsType;
  constraints: Constraint;
}

export function TagsEditorConstraints(props: TagEditorConstraintsProps) {
  const { constraintsType, constraints } = props;
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
          Requires at least {constraints.min} {constraints.min === 1 ? 'tag' : 'tags'}
        </span>
      )}
      {constraintsType === 'max' && (
        <span>
          Requires no more than {constraints.max} {constraints.max === 1 ? 'tag' : 'tags'}
        </span>
      )}
      {constraintsType === 'min-max' && constraints.max !== constraints.min && (
        <span>
          Requires between {constraints.min} and {constraints.max} tags
        </span>
      )}
      {constraintsType === 'min-max' && constraints.max === constraints.min && (
        <span>
          Requires exactly {constraints.max} {constraints.max === 1 ? 'tag' : 'tags'}
        </span>
      )}
    </Text>
  );
}
