import type { FieldExtensionSDK } from '@contentful/field-editor-shared';
import { editorInterfaceDefaults } from 'contentful-management';

import type { WidgetType } from './types';

export function getDefaultWidgetId(
  sdk: Pick<FieldExtensionSDK, 'field' | 'contentType'>
): WidgetType {
  const field = sdk.field;

  // @ts-expect-error FieldExtensionSDK.field doesn't include all the
  // properties of ContentFields type. It should be fixed
  return editorInterfaceDefaults.default.getDefaultControlOfField(field).widgetId;
}
