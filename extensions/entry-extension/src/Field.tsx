import * as React from 'react';
import tokens from '@contentful/forma-36-tokens';
import { HelpText } from '@contentful/forma-36-react-components';
import { LocalesAPI } from '@contentful/field-editor-shared';
import { css } from 'emotion';
import { SDKContext } from './shared';

import { NumberEditor } from '../../../packages/number/src/index';
import { SingleLineEditor } from '../../../packages/single-line/src/index';
import { BooleanEditor } from '../../../packages/boolean/src/index';
import { DateEditor } from '../../../packages/date/src/index';
import { LocationEditor } from '../../../packages/location/src/index';

import { EntryFieldAPI } from 'contentful-ui-extensions-sdk';

const styles = {
  wrapper: css({
    borderLeft: '3px solid #c5d2d8',
    paddingLeft: '1em',
    marginBottom: '29px',
    marginTop: '19px',
    transition: 'border-color 0.18s linear',
    '&:focus-within': {
      borderColor: tokens.colorPrimary
    }
  }),
  label: css({
    color: tokens.colorTextLightest
  })
};

interface FieldProps {
  field: EntryFieldAPI;
  locales: LocalesAPI;
}

export const Field: React.FC<FieldProps> = ({ field, locales }: FieldProps) => {
  // these properties are mocked to make the entryFieldAPI
  // work, or at least not crash, when used in the palce of FieldAPI
  const extendedField: any = field;
  extendedField.onSchemaErrorsChanged = () => null;
  extendedField.setInvalid = () => null;
  extendedField.locale = 'en-US';
  locales.direction = { 'en-US': 'ltr' };

  const sdk = React.useContext(SDKContext);

  const fieldDetails = sdk.contentType.fields.find(({ id }) => id === extendedField.id);

  if (fieldDetails) {
    switch (extendedField.type) {
      case 'Symbol':
        return (
          <FieldWrapper>
            <label>
              <HelpText>
                {fieldDetails.name}
                {fieldDetails.required ? ' (required)' : ''}
              </HelpText>
              <SingleLineEditor field={extendedField} locales={locales} />
            </label>
          </FieldWrapper>
        );

      case 'Integer':
        return (
          <FieldWrapper>
            <label>
              <HelpText>
                {fieldDetails.name}
                {fieldDetails.required ? ' (required)' : ''}
              </HelpText>
              <NumberEditor field={extendedField} />
            </label>
          </FieldWrapper>
        );

      case 'Boolean':
        return (
          <FieldWrapper>
            <label>
              <HelpText>
                {fieldDetails.name}
                {fieldDetails.required ? ' (required)' : ''}
              </HelpText>
              <BooleanEditor field={extendedField} />
            </label>
          </FieldWrapper>
        );

      // TODO: the styling for date fields looks very wrong at the moment
      case 'Date':
        return (
          <FieldWrapper>
            <label>
              <HelpText>
                {fieldDetails.name}
                {fieldDetails.required ? ' (required)' : ''}
              </HelpText>
              <DateEditor field={extendedField} />
            </label>
          </FieldWrapper>
        );

      case 'Location':
        return (
          <FieldWrapper>
            <label>
              <HelpText>
                {fieldDetails.name}
                {fieldDetails.required ? ' (required)' : ''}
              </HelpText>
              <LocationEditor field={extendedField} />
            </label>
          </FieldWrapper>
        );

      case 'Link':
      case 'RichText':
        // these field editors are not fully implemented yet
        return (
          <FieldWrapper>
            field {fieldDetails.name} of type {extendedField.type} was not implemented yet
          </FieldWrapper>
        );
    }
  }

  throw new Error(`unrecognised field type ${extendedField.type}`);
};

interface FieldWrapperProps {
  children: React.ReactNode;
}
const FieldWrapper: React.FC<FieldWrapperProps> = function({ children }: FieldWrapperProps) {
  return <div className={styles.wrapper}>{children}</div>;
};
