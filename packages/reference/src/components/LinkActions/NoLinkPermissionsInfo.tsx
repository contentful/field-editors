import * as React from 'react';

import { Paragraph } from '@contentful/f36-components';
import { t } from '@lingui/core/macro';

export function NoLinkPermissionsInfo() {
  return (
    <Paragraph>
      {t({
        id: 'FieldEditors.Reference.NoLinkPermissionsInfo.Message',
        message:
          'You don&apos;t have permission to view this content or this field is not correctly configured. Contact your administrator for help.',
      })}
    </Paragraph>
  );
}
