/* eslint-disable you-dont-need-lodash-underscore/find */
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { BLOCKS, INLINES, MARKS, TOP_LEVEL_BLOCKS } from '@contentful/rich-text-types';
import find from 'lodash/find';
import flow from 'lodash/flow';
import get from 'lodash/get';

// TODO: Move these into separate package (maybe rich-text-types) and share with FE.
export const VALIDATIONS = {
  ENABLED_MARKS: 'enabledMarks',
  ENABLED_NODE_TYPES: 'enabledNodeTypes',
};
export const DEFAULT_ENABLED_NODE_TYPES = [BLOCKS.DOCUMENT, BLOCKS.PARAGRAPH, 'text'];

export const VALIDATABLE_NODE_TYPES = ([] as Array<BLOCKS | INLINES>)
  .concat(TOP_LEVEL_BLOCKS)
  .filter((type) => type !== BLOCKS.PARAGRAPH)
  .concat(Object.values(INLINES));

// TODO: Memoize
const getRichTextValidation = (field, validationType) =>
  flow(
    (v) => find(v, validationType),
    (v) => get(v, validationType)
  )(field.validations);

const isFormattingOptionEnabled = (field, validationType, nodeTypeOrMark) => {
  const enabledFormattings = getRichTextValidation(field, validationType);

  // TODO: In the future, validations will always be opt-in. In that case
  // we don't need this step.
  if (enabledFormattings === undefined) {
    if ([MARKS.SUBSCRIPT, MARKS.SUPERSCRIPT].includes(nodeTypeOrMark)) {
      return false;
    }

    return true;
  }

  return DEFAULT_ENABLED_NODE_TYPES.concat(enabledFormattings).includes(nodeTypeOrMark);
};

export const isNodeTypeEnabled = (field: FieldExtensionSDK['field'], nodeType): boolean =>
  isFormattingOptionEnabled(field, VALIDATIONS.ENABLED_NODE_TYPES, nodeType);

export const isMarkEnabled = (field: FieldExtensionSDK['field'], mark) =>
  isFormattingOptionEnabled(field, VALIDATIONS.ENABLED_MARKS, mark);
