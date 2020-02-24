import React from 'react';
import { File } from '../types';

interface AssetThumbnailProps {
  file: File;
}

/**
 * Checks whether the passed content type matches one of our valid MIME types
 */
export function isValidImage(file: File) {
  const validMimeTypes = [
    'image/bmp',
    'image/x-windows-bmp',
    'image/gif',
    'image/webp',
    // This is not a valid MIME type but we supported it in the past.
    'image/jpg',
    'image/jpeg',
    'image/pjpeg',
    'image/x-jps',
    'image/png',
    'image/svg+xml'
  ];

  return validMimeTypes.includes(file.contentType);
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
