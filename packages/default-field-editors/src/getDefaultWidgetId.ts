import type { FieldAppSDK } from '@contentful/field-editor-shared';
import { editorInterfaceDefaults } from 'contentful-management';

import type { WidgetType } from './types.js';

export function getDefaultWidgetId(sdk: Pick<FieldAppSDK, 'field' | 'contentType'>): WidgetType {
  const field = sdk.field;

  // @ts-expect-error FieldAppSDK.field doesn't include all the
  // properties of ContentFields type. It should be fixed
  return editorInterfaceDefaults.default.getDefaultControlOfField(field).widgetId;
}
