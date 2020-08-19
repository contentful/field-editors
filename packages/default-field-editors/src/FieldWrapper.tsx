import * as React from 'react';
import { HelpText, FieldGroup, FormLabel } from '@contentful/forma-36-react-components';
import { ValidationErrors } from '@contentful/field-editor-validation-errors';
import type { BaseExtensionSDK, Entry, FieldAPI } from '@contentful/field-editor-shared';
import { styles } from './FieldWrapper.styles';

type FieldWrapperProps = {
  name: string;
  sdk: BaseExtensionSDK;
  field: FieldAPI;
  getEntryURL: (entry: Entry) => string;
  className?: string;
  children: React.ReactNode;
  renderLabel?: (name: string, field: FieldAPI) => JSX.Element | null;
  renderHelpText?: (helpText: string) => JSX.Element | null;
};

export const FieldWrapper: React.FC<FieldWrapperProps> = function ({
  name,
  sdk,
  field,
  getEntryURL,
  className,
  children,
  renderLabel,
  renderHelpText,
}: FieldWrapperProps) {
  const helpText = (sdk.parameters?.instance as any)?.helpText;
  const required = field.required;

  return (
    <FieldGroup className={className}>
      {renderLabel ? (
        renderLabel(name, field)
      ) : (
        <FormLabel htmlFor={field.id}>
          {name}
          {required ? ' (required)' : ''}
        </FormLabel>
      )}

      {children}

      <ValidationErrors
        field={field}
        space={sdk.space}
        locales={sdk.locales}
        getEntryURL={getEntryURL}
      />

      {renderHelpText
        ? renderHelpText(helpText)
        : helpText && (
            <HelpText className={styles.helpText} testId="field-hint">
              {helpText}
            </HelpText>
          )}
    </FieldGroup>
  );
};
