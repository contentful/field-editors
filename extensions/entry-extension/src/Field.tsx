import * as React from 'react';
import { SingleLineEditor } from '../../../packages/single-line/src/index';
import tokens from '@contentful/forma-36-tokens';
import { HelpText } from '@contentful/forma-36-react-components';
import { NumberEditor } from '../../../packages/number/src/index';
import { LocalesAPI } from '@contentful/field-editor-shared';
import { css } from 'emotion';
import { SDKContext } from './shared';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';

const styles = {
  wrapper: css({
    borderLeft: '3px solid #c5d2d8',
    paddingLeft: '1em',
    marginBottom: '29px',
    marginTop: '19px',
    transition: 'border-color 0.18s linear',
    '&:focus-within': {
      borderColor: tokens.colorPrimary,
    },
  }),
  label: css({
    color: tokens.colorTextLightest,
  }),
};

export const Field = ({ field, locales }: { field: any; locales: LocalesAPI }) => {
  // these properties are mocked to make the entryFieldAPI
  // work, or at least no crash, when used in the palce of FieldAPI
  field.onSchemaErrorsChanged = () => {};
  field.setInvalid = () => {};
  field.locale = 'en-US';
  locales.direction = {};
  locales.direction['en-US'] = 'ltr';

  const sdk = React.useContext(SDKContext);
  const fieldDetails = sdk.contentType.fields.find(({ id }) => id === field.id);
  console.log({ fieldDetails });

  switch (field.type) {
    case 'Symbol':
      return (
        <FieldWrapper>
          <label>
            <HelpText>
              {fieldDetails.name}
              {fieldDetails.required ? ' (required)' : ''}
            </HelpText>
            <SingleLineEditor field={field} locales={locales} />
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
            <NumberEditor field={field} />
          </label>
        </FieldWrapper>
      );
  }

  return (
    <FieldWrapper>
      field {fieldDetails.name} of type {field.type} was not implemented yet
    </FieldWrapper>
  );
};

interface FieldWrapperProps {
  children: React.ReactNode;
}
const FieldWrapper: React.FC<FieldWrapperProps> = function({ children }: FieldWrapperProps) {
  return <div className={styles.wrapper}>{children}</div>;
};
