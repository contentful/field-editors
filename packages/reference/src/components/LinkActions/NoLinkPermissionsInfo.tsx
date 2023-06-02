import * as React from 'react';

import { Paragraph } from '@contentful/f36-components';

export function NoLinkPermissionsInfo() {
  return (
    <Paragraph>
      You don&apos;t have permission to view this content or this field is not correctly configured.
      Contact your administrator for help.
    </Paragraph>
  );
}
