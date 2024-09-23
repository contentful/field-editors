import * as React from 'react';

import { File } from '../../types';

interface AssetThumbnailProps {
  file: File;
}

const dimensions = { width: 70, height: 70 };

export function AssetThumbnail(props: AssetThumbnailProps) {
  return (
    <img
      alt={props.file.fileName}
      src={`${props.file.url}?w=${dimensions.width}&h=${dimensions.height}&fit=thumb`}
      height={dimensions.height}
      width={dimensions.width}
    />
  );
}
