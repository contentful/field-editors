import * as React from 'react';

import { Badge } from '@contentful/f36-components';

export const ResourceNewBadge = () => {
  return (
    <>
      {' '}
      (different space){' '}
      <Badge variant="primary-filled" size="small">
        new
      </Badge>
    </>
  );
};
