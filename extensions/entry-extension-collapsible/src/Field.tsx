import * as React from 'react';
import { HelpText } from '@contentful/forma-36-react-components';
import { LocalesAPI, FieldAPI } from '@contentful/field-editor-shared';
import { EntryFieldAPI } from 'contentful-ui-extensions-sdk';
import { Field as BaseField } from '../../../packages/field/src/index';
import styles from './styles';
import { SDKContext, getEntryURL } from './shared';
import '../../../packages/date/styles/styles';
import '../../../packages/json/src/codemirrorImports';
import { ValidationErrors } from '../../../packages/validation-errors/src/index';

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
    <FieldWrapper field={extendedField} name={fieldDetails.name} required={fieldDetails.required}>
      <BaseField widgetId={widgetId} sdk={fieldSdk} isInitiallyDisabled={false} />
    </FieldWrapper>
  );
};

interface FieldWrapperProps {
  children: React.ReactNode;
  name: string;
  required: boolean;
  field: FieldAPI;
}

const FieldWrapper: React.FC<FieldWrapperProps> = function ({
  children,
  name,
  required,
  field,
}: FieldWrapperProps) {
  const sdk = React.useContext(SDKContext);

  return (
    <div className={styles.fieldWrapper}>
      <HelpText>
        {name}
        {required ? ' (required)' : ''}
      </HelpText>

      {children}

      <ValidationErrors
        field={field}
        space={sdk.space}
        locales={sdk.locales}
        getEntryURL={getEntryURL}
      />
    </div>
  );
};
