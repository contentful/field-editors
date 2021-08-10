/* eslint-disable you-dont-need-lodash-underscore/find */
import find from 'lodash/find';
import flow from 'lodash/flow';
import get from 'lodash/get';
import { BLOCKS, INLINES, TOP_LEVEL_BLOCKS } from '@contentful/rich-text-types';
import { FieldExtensionSDK } from '@contentful/app-sdk';

// TODO: Move this into separate package (maybe rich-text-types) and share with FE.
export const VALIDATIONS = {
  ENABLED_MARKS: 'enabledMarks',
  ENABLED_NODE_TYPES: 'enabledNodeTypes'
};

export const VALIDATABLE_NODE_TYPES =
  ([] as Array<BLOCKS | INLINES>)
    .concat(TOP_LEVEL_BLOCKS)
    .filter(type => type !== BLOCKS.PARAGRAPH)
    .concat(Object.values(INLINES));

const getRichTextValidation = (field, validationType) =>
  flow(
    v => find(v, validationType),
    v => get(v, validationType)
  )(field.validations);

const isFormattingOptionEnabled = (field, validationType, nodeTypeOrMark) => {
  const enabledFormattings = getRichTextValidation(field, validationType);

  if (enabledFormattings === undefined) {
    return true;
  }

  return enabledFormattings.includes(nodeTypeOrMark);
};

export const isNodeTypeEnabled = (field: FieldExtensionSDK['field'], nodeType): boolean =>
  isFormattingOptionEnabled(field, VALIDATIONS.ENABLED_NODE_TYPES, nodeType);

export const isMarkEnabled = (field: FieldExtensionSDK['field'], mark) =>
  isFormattingOptionEnabled(field, VALIDATIONS.ENABLED_MARKS, mark);
