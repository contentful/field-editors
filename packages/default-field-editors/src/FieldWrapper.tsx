import * as React from 'react';
import { HelpText, FieldGroup, FormLabel } from '@contentful/forma-36-react-components';
import { ValidationErrors } from '@contentful/field-editor-validation-errors';
import type { BaseExtensionSDK, Entry, FieldAPI } from '@contentful/field-editor-shared';

type FieldWrapperProps = {
  sdk: BaseExtensionSDK;
  field: FieldAPI;
  children: React.ReactNode;
  name: string;
  required: boolean;
  className?: string;
  getEntryURL: (entry: Entry) => string;
};

export const FieldWrapper: React.FC<FieldWrapperProps> = function ({
  sdk,
  children,
  name,
  required,
  field,
  className,
  getEntryURL,
}: FieldWrapperProps) {
  const helpText = (sdk.parameters.instance as any).helpText;

  return (
    <FieldGroup className={className}>
      <FormLabel htmlFor={field.id}>
        {name}
        {required ? ' (required)' : ''}
      </FormLabel>

      {children}

      <ValidationErrors
        field={field}
        space={sdk.space}
        locales={sdk.locales}
        getEntryURL={getEntryURL}
      />

      {helpText && <HelpText testId="field-hint">{helpText}</HelpText>}
    </FieldGroup>
  );
};
