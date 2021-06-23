import * as React from 'react';
import { LocalesAPI } from '@contentful/field-editor-shared';
import { EntryFieldAPI, FieldExtensionSDK } from '@contentful/app-sdk';
import {
  Field as BaseField,
  FieldWrapper,
} from '@contentful/default-field-editors';
import { SDKContext, getEntryURL } from './shared';
import 'codemirror/lib/codemirror.css';
import '@contentful/field-editor-date/styles/styles.css';

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

  if (!fieldDetails || !fieldEditorInterface) {
    return null;
  }

  const fieldSdk: FieldExtensionSDK = {
    ...sdk,
    field: extendedField,
    locales,
    parameters: {
      ...sdk.parameters,
      instance: {
        ...sdk.parameters.instance,
        ...fieldEditorInterface?.settings,
      },
    },
  } as any;

  return (
    <FieldWrapper sdk={fieldSdk} name={fieldDetails.name} getEntryURL={getEntryURL}>
      <BaseField widgetId={widgetId} sdk={fieldSdk} isInitiallyDisabled={false} />
    </FieldWrapper>
  );
};
