import * as React from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import tokens from '@contentful/f36-tokens';
import { CharCounter, CharValidation, ConstraintsUtils } from '@contentful/field-editor-shared';
import { css } from 'emotion';

const styles = {
  root: css({
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: tokens.fontSizeM,
    marginTop: tokens.spacingXs,
    color: tokens.gray500,
  }),
};

export function MarkdownConstraints(props: { sdk: FieldAppSDK; value: string }) {
  const constraints = ConstraintsUtils.fromFieldValidations(
    props.sdk.field.validations,
    props.sdk.field.type as 'Text'
  );

  const checkConstraint = ConstraintsUtils.makeChecker(constraints);

  return (
    <div className={styles.root}>
      <CharValidation constraints={constraints} />
      <CharCounter
        value={props.value}
        checkConstraint={checkConstraint}
        constraints={constraints}
      />
    </div>
  );
}
