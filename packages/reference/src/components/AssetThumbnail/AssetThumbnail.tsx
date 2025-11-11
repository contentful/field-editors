import * as React from 'react';

import { entityHelpers } from '@contentful/field-editor-shared';

import { File } from '../../types';

interface AssetThumbnailProps {
  file: File;
}

const dimensions = { width: 70, height: 70 };

export function AssetThumbnail(props: AssetThumbnailProps) {
  const thumbnailUrl = entityHelpers.getResolvedImageUrl(props.file.url as string, dimensions);

  return (
    <img
      alt={props.file.fileName}
      src={thumbnailUrl}
      height={dimensions.height}
      width={dimensions.width}
    />
  );
}
