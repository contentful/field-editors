import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import { ConstraintsUtils, CharCounter, CharValidation } from '@contentful/field-editor-shared';

const styles = {
  root: css({
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: tokens.fontSizeM,
    marginTop: tokens.spacingXs,
    color: tokens.colorTextMid,
  }),
};

export function MarkdownConstraints(props: { sdk: FieldExtensionSDK; value: string }) {
  const constraints = ConstraintsUtils.fromFieldValidations(
    props.sdk.field.validations,
    props.sdk.field.type as 'Text'
  );

  const checkConstraint = ConstraintsUtils.makeChecker(constraints);

  return (
    <div className={styles.root}>
      <CharCounter value={props.value} checkConstraint={checkConstraint} />
      <CharValidation constraints={constraints} />
    </div>
  );
}
