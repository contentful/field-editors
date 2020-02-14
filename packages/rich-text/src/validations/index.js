import flow from 'lodash/flow';
import find from 'lodash/find';
import get from 'lodash/get';
import { BLOCKS, INLINES, TOP_LEVEL_BLOCKS } from '@contentful/rich-text-types';

// TODO: Move this into separate package (maybe rich-text-types) and share with FE.
export const VALIDATIONS = {
  ENABLED_MARKS: 'enabledMarks',
  ENABLED_NODE_TYPES: 'enabledNodeTypes'
};

export const VALIDATABLE_NODE_TYPES = [
  ...TOP_LEVEL_BLOCKS.filter(type => type !== BLOCKS.PARAGRAPH),
  ...Object.values(INLINES)
];

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

/**
 * Checks if nodeType is enabled in the Rich Text Editor Field
 *
 * @param {FieldInfo} field
 * @param {string} nodeType
 * @returns {boolean}
 */
export const isNodeTypeEnabled = (field, nodeType) =>
  isFormattingOptionEnabled(field, VALIDATIONS.ENABLED_NODE_TYPES, nodeType);

/**
 * Checks if mark is enabled in the Rich Text Editor Field
 *
 * @param {FieldInfo} field
 * @param {string} mark
 * @returns {boolean}
 */
export const isMarkEnabled = (field, mark) =>
  isFormattingOptionEnabled(field, VALIDATIONS.ENABLED_MARKS, mark);
