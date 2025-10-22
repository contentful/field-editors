import React from 'react';

import tokens from '@contentful/f36-tokens';
import { CharValidation, ConstraintsUtils } from '@contentful/field-editor-shared';
import { css, cx } from 'emotion';

import { usePlateEditorState } from './internal/hooks';
import { useSdkContext } from './SdkProvider';

const styles = {
  container: css({
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: tokens.fontSizeM,
    marginTop: tokens.spacingXs,
    color: tokens.gray700,
  }),
  counterInvalid: css({
    color: tokens.red600,
  }),
};

interface CharCounterProps {
  checkConstraints: (value: number) => boolean;
}

function CharCounter({ checkConstraints }: CharCounterProps) {
  const editor = usePlateEditorState();

  const count = editor.getCharacterCount();
  const valid = checkConstraints(count);

  return (
    <span
      className={cx({
        [styles.counterInvalid]: !valid,
      })}
    >
      {count} characters
    </span>
  );
}

export function CharConstraints() {
  const sdk = useSdkContext();

  const { constraints, checkConstraints } = React.useMemo(() => {
    const constraints = ConstraintsUtils.fromFieldValidations(sdk.field.validations, 'RichText');
    const checkConstraints = ConstraintsUtils.makeChecker(constraints);

    return { constraints, checkConstraints };
  }, [sdk.field.validations]);

  return (
    <div className={styles.container}>
      <CharCounter checkConstraints={checkConstraints} />
      <CharValidation constraints={constraints} />
    </div>
  );
}
