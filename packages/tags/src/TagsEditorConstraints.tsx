import React from 'react';
import { css } from 'emotion';
import { Paragraph } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { Constraint, ConstraintsType } from './types';

const styles = {
  constraints: css({
    fontStyle: 'italic',
    marginTop: tokens.spacingS,
    color: tokens.colorTextLight
  })
};

interface TagEditorConstraintsProps {
  constraintsType: ConstraintsType;
  constraints: Constraint;
}

export function TagsEditorConstraints(props: TagEditorConstraintsProps) {
  const { constraintsType, constraints } = props;
  return (
    <Paragraph className={styles.constraints} testId="tag-editor-constraints">
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
    </Paragraph>
  );
}
