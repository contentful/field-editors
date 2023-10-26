import { File } from '../typesEntity';

/**
 * Checks whether the passed content type matches one of our valid MIME types
 */
export function isValidImage(file: File) {
  const validMimeTypes = [
    'image/avif',
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
    'image/svg+xml',
  ];

  return validMimeTypes.includes(file.contentType);
}
