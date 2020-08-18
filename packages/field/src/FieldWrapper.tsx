import * as React from 'react';
import { BaseExtensionSDK, Entry, FieldAPI } from '@contentful/field-editor-shared';
import { HelpText } from '@contentful/forma-36-react-components';
import { ValidationErrors } from '@contentful/field-editor-validation-errors';

type FieldWrapperProps = {
  sdk: BaseExtensionSDK;
  children: React.ReactNode;
  name: string;
  required: boolean;
  field: FieldAPI;
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
  return (
    <div className={className}>
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
