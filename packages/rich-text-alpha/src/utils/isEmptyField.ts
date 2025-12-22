import { EMPTY_DOCUMENT } from '@contentful/rich-text-types';
import deepEquals from 'fast-deep-equal';

export function isEmptyField(value: unknown): boolean {
  return !value || deepEquals(value, EMPTY_DOCUMENT);
}
