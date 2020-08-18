import * as React from 'react';
import { LocalesAPI } from '@contentful/field-editor-shared';
import { EntryFieldAPI } from 'contentful-ui-extensions-sdk';
import { Field as BaseField, FieldWrapper } from '../../../packages/field/src/index';
import styles from './styles';
import { SDKContext, getEntryURL } from './shared';
import '../../../packages/date/styles/styles';
import '../../../packages/json/src/codemirrorImports';

interface FieldProps {
  field: EntryFieldAPI;
  locales: LocalesAPI;
}

export const Field: React.FC<FieldProps> = ({ field, locales }: FieldProps) => {
  const sdk = React.useContext(SDKContext);
  const extendedField = field.getForLocale(sdk.locales.default);
  const fieldDetails = sdk.contentType.fields.find(({ id }) => id === extendedField.id);
  const fieldEditorInterface = sdk.editor.editorInterface?.controls?.find(
    ({ fieldId }) => fieldId === extendedField.id
  );
  const widgetId = fieldEditorInterface?.widgetId ?? '';
  const fieldSdk: any = sdk;
  fieldSdk.field = extendedField;
  fieldSdk.locales = locales;

  if (!fieldDetails || !fieldEditorInterface) {
    return null;
  }

  return (
    <FieldWrapper
      sdk={sdk}
      className={styles.fieldWrapper}
      field={extendedField}
      name={fieldDetails.name}
      required={fieldDetails.required}
      getEntryURL={getEntryURL}>
      <BaseField widgetId={widgetId} sdk={fieldSdk} isInitiallyDisabled={false} />
    </FieldWrapper>
  );
};
