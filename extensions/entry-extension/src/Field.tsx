import * as React from 'react';
import tokens from '@contentful/forma-36-tokens';
import { HelpText } from '@contentful/forma-36-react-components';
import { LocalesAPI, FieldAPI } from '@contentful/field-editor-shared';
import { css } from 'emotion';
import { SDKContext } from './shared';
import { EntryFieldAPI } from 'contentful-ui-extensions-sdk';
import { NumberEditor } from '../../../packages/number/src/index';
import { SingleLineEditor } from '../../../packages/single-line/src/index';
import { BooleanEditor } from '../../../packages/boolean/src/index';
import { DateEditor } from '../../../packages/date/src/index';
import '../../../packages/date/styles/styles';
import { LocationEditor } from '../../../packages/location/src/index';
import { JsonEditor } from '../../../packages/json/src/index';
import '../../../packages/json/src/codemirrorImports';
import { MultipleLineEditor } from '../../../packages/multiple-line/src/index';
import { TagsEditor } from '../../../packages/tags/src/index';
import { SlugEditor } from '../../../packages/slug/src/index';
import { DropdownEditor } from '../../../packages/dropdown/src/index';
import { UrlEditor } from '../../../packages/url/src/index';
import { RadioEditor } from '../../../packages/radio/src/index';
import { RatingEditor } from '../../../packages/rating/src/index';

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
  const extendedField = (field as any) as FieldAPI;
  extendedField.onSchemaErrorsChanged = () => () => null;
  extendedField.setInvalid = () => null;
  extendedField.locale = 'en-US';

  const sdk = React.useContext(SDKContext);

  const fieldDetails = sdk.contentType.fields.find(({ id }) => id === extendedField.id);
  const fieldEditorInterface = sdk.editor.editorInterface?.controls?.find(
    ({ fieldId }) => fieldId === extendedField.id
  );

  // not used editors
  // - checkbox
  // - list
  //
  // TODO: extract fieldwrapper etc to common component
  if (fieldDetails && fieldEditorInterface) {
    console.log(fieldEditorInterface.widgetId);
    switch (fieldEditorInterface.widgetId) {
      case 'markdown':
      case 'assetLinkEditor':
      case 'entryLinkEditor':
        return (
          <FieldWrapper>
            widget for {fieldDetails.name} of type {fieldEditorInterface.widgetId} was not
            implemented yet
          </FieldWrapper>
        );

      case 'multipleLine':
        return (
          <FieldWrapper>
            <label>
              <HelpText>
                {fieldDetails.name}
                {fieldDetails.required ? ' (required)' : ''}
              </HelpText>
              <MultipleLineEditor field={extendedField} locales={locales} />
            </label>
          </FieldWrapper>
        );

      case 'boolean':
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

      case 'objectEditor':
        return (
          <FieldWrapper>
            <label>
              <HelpText>
                {fieldDetails.name}
                {fieldDetails.required ? ' (required)' : ''}
              </HelpText>
              <JsonEditor isInitiallyDisabled={false} field={extendedField} />
            </label>
          </FieldWrapper>
        );

      case 'datePicker':
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

      case 'locationEditor':
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

      case 'rating':
        return (
          <FieldWrapper>
            <label>
              <HelpText>
                {fieldDetails.name}
                {fieldDetails.required ? ' (required)' : ''}
              </HelpText>
              <RatingEditor field={extendedField} />
            </label>
          </FieldWrapper>
        );

      case 'radio':
        return (
          <FieldWrapper>
            <label>
              <HelpText>
                {fieldDetails.name}
                {fieldDetails.required ? ' (required)' : ''}
              </HelpText>
              <RadioEditor field={extendedField} locales={locales} />
            </label>
          </FieldWrapper>
        );

      case 'tagEditor':
        return (
          <FieldWrapper>
            <label>
              <HelpText>
                {fieldDetails.name}
                {fieldDetails.required ? ' (required)' : ''}
              </HelpText>
              <TagsEditor field={extendedField} />
            </label>
          </FieldWrapper>
        );

      case 'numberEditor':
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

      case 'urlEditor':
        // TODO: verify this is correct - as it appears identical to normal
        // single line editor..
        return (
          <FieldWrapper>
            <label>
              <HelpText>
                {fieldDetails.name}
                {fieldDetails.required ? ' (required)' : ''}
              </HelpText>
              <UrlEditor field={extendedField} />
            </label>
          </FieldWrapper>
        );

      case 'slugEditor':
        return (
          <FieldWrapper>
            <label>
              <HelpText>
                {fieldDetails.name}
                {fieldDetails.required ? ' (required)' : ''}
              </HelpText>
              <SlugEditor field={extendedField} baseSdk={sdk} />
            </label>
          </FieldWrapper>
        );

      case 'singleLine':
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

      case 'dropdown':
        return (
          <FieldWrapper>
            <label>
              <HelpText>
                {fieldDetails.name}
                {fieldDetails.required ? ' (required)' : ''}
              </HelpText>
              <DropdownEditor field={extendedField} locales={locales} />
            </label>
          </FieldWrapper>
        );
    }
    throw new Error(
      `unrecognised widget ${fieldEditorInterface.widgetId} for field of type ${extendedField.type}`
    );
  } else {
    return null;
  }
};

interface FieldWrapperProps {
  children: React.ReactNode;
}
const FieldWrapper: React.FC<FieldWrapperProps> = function({ children }: FieldWrapperProps) {
  return <div className={styles.wrapper}>{children}</div>;
};
