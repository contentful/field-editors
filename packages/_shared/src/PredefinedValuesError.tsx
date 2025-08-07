import * as React from 'react';

import { Note } from '@contentful/f36-note';
import { t } from '@lingui/core/macro';

export function PredefinedValuesError() {
  return (
    <Note variant="warning" testId="predefined-values-warning">
      {t({
        id: 'FieldEditors.Shared.PredefinedValuesError.ErrorMessage',
        message:
          'The widget failed to initialize. You can fix the problem by providing predefined values under the validations tab in the field settings.',
      })}
    </Note>
  );
}
