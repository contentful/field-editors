import React from 'react';
import { Note } from '@contentful/forma-36-react-components';

export function PredefinedValuesError() {
  return (
    <Note noteType="warning" testId="predefined-values-warning">
      The widget failed to initialize. You can fix the problem by providing predefined values under
      the validations tab in the field settings.
    </Note>
  );
}
