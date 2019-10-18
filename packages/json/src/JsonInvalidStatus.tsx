import React from 'react';
import { ValidationMessage } from '@contentful/forma-36-react-components';

export function JsonInvalidStatus() {
  return (
    <div role="status" data-status-code="json-editor.invalid-json">
      <ValidationMessage>This is not valid JSON</ValidationMessage>
    </div>
  );
}
