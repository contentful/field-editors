import _ from 'lodash';

// TODO: move closer to the root level (models?)
import ValidationType from 'components/field_dialog/RichTextValidationType';

const getRichTextValidation = (field, validationType) => {
  return _(field.validations)
    .chain()
    .find(validation => _.has(validation, validationType))
    .get(validationType)
    .value();
};

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
  isFormattingOptionEnabled(field, ValidationType.ENABLED_NODE_TYPES, nodeType);

/**
 * Checks if mark is enabled in the Rich Text Editor Field
 *
 * @param {FieldInfo} field
 * @param {string} mark
 * @returns {boolean}
 */
export const isMarkEnabled = (field, mark) =>
  isFormattingOptionEnabled(field, ValidationType.ENABLED_MARKS, mark);
