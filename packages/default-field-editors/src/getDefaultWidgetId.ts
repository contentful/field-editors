import type { FieldExtensionSDK } from '@contentful/field-editor-shared';
import type { WidgetType } from './types';

const DROPDOWN_TYPES = ['Text', 'Symbol', 'Integer', 'Number', 'Boolean'];

export const DEFAULTS: { [key: string]: WidgetType } = {
  Text: 'markdown',
  Symbol: 'singleLine',
  Integer: 'numberEditor',
  Number: 'numberEditor',
  Boolean: 'boolean',
  Date: 'datePicker',
  Location: 'locationEditor',
  Object: 'objectEditor',
  RichText: 'richTextEditor',
  Entry: 'entryLinkEditor',
  Asset: 'assetLinkEditor',
  Symbols: 'tagEditor',
  Entries: 'entryLinksEditor',
  Assets: 'assetLinksEditor',
  File: 'fileEditor',
};

export function getDefaultWidgetId(
  sdk: Pick<FieldExtensionSDK, 'field' | 'contentType'>
): WidgetType {
  const field = sdk.field;
  const fieldType = field.type;
  const hasInValidation = (field.validations || []).find((v) => 'in' in v);

  if (hasInValidation && DROPDOWN_TYPES.includes(fieldType)) {
    return 'dropdown';
  }

  const displayFieldId = sdk.contentType.displayField;

  const isTextField = fieldType === 'Text';
  const isDisplayField = field.id === displayFieldId;

  if (isTextField && isDisplayField) {
    return 'singleLine';
  }

  return DEFAULTS[fieldType];
}
