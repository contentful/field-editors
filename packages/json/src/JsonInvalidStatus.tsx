import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/f36-tokens';
import { ValidationMessage } from '@contentful/f36-components';

export function JsonInvalidStatus() {
  return (
    <div
      role="status"
      data-test-id="json-editor.invalid-json"
      className={css({ marginTop: tokens.spacingS })}>
      <ValidationMessage>This is not valid JSON</ValidationMessage>
    </div>
  );
}
