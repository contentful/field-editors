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

  // These field editors are currently unused
  // - checkbox
  // - list

  if (fieldDetails && fieldEditorInterface) {
    switch (fieldEditorInterface.widgetId) {
      case 'markdown':
      case 'assetLinkEditor':
      case 'entryLinkEditor':
        return (
          <FieldWrapper name={fieldDetails.name} required={false}>
            widget for {fieldDetails.name} of type {fieldEditorInterface.widgetId} was not
            implemented yet
          </FieldWrapper>
        );

      case 'multipleLine':
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <MultipleLineEditor field={extendedField} locales={locales} />
          </FieldWrapper>
        );

      case 'boolean':
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <BooleanEditor field={extendedField} />
          </FieldWrapper>
        );

      case 'objectEditor':
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <JsonEditor isInitiallyDisabled={false} field={extendedField} />
          </FieldWrapper>
        );

      case 'datePicker':
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <DateEditor field={extendedField} />
          </FieldWrapper>
        );

      case 'locationEditor':
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <LocationEditor field={extendedField} />
          </FieldWrapper>
        );

      case 'rating':
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <RatingEditor field={extendedField} />
          </FieldWrapper>
        );

      case 'radio':
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <RadioEditor field={extendedField} locales={locales} />
          </FieldWrapper>
        );

      case 'tagEditor':
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <TagsEditor field={extendedField} />
          </FieldWrapper>
        );

      case 'numberEditor':
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <NumberEditor field={extendedField} />
          </FieldWrapper>
        );

      case 'urlEditor':
        // TODO: verify this is correct - as it appears identical to normal
        // single line editor..
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <UrlEditor field={extendedField} />
          </FieldWrapper>
        );

      case 'slugEditor':
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <SlugEditor field={extendedField} baseSdk={sdk} />
          </FieldWrapper>
        );

      case 'singleLine':
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <SingleLineEditor field={extendedField} locales={locales} />
          </FieldWrapper>
        );

      case 'dropdown':
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <DropdownEditor field={extendedField} locales={locales} />
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
  name: string;
  required: boolean;
}
const FieldWrapper: React.FC<FieldWrapperProps> = function({
  children,
  name,
  required
}: FieldWrapperProps) {
  return (
    <div className={styles.wrapper}>
      <label>
        <HelpText>
          {name}
          {required ? ' (required)' : ''}
        </HelpText>
        {children}
      </label>
    </div>
  );
};
