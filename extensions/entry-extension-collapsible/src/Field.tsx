import * as React from 'react';
import { HelpText } from '@contentful/forma-36-react-components';
import { LocalesAPI } from '@contentful/field-editor-shared';
import styles from './styles';
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
import { CheckboxEditor } from '../../../packages/checkbox/src/index';
import { ListEditor } from '../../../packages/list/src/index';
import {
  SingleEntryReferenceEditor,
  MultipleEntryReferenceEditor,
  SingleMediaEditor,
  MultipleMediaEditor
} from '../../../packages/reference/src/index';

import { RichTextEditor } from '../../../packages/rich-text/src/index';
import { MarkdownEditor } from '../../../packages/markdown/src/index';

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

  if (fieldDetails && fieldEditorInterface) {
    switch (fieldEditorInterface.widgetId) {
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

      case 'checkbox':
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <CheckboxEditor field={extendedField} locales={locales} />
          </FieldWrapper>
        );

      case 'listInput':
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <ListEditor field={extendedField} locales={locales} />
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

      case 'entryLinkEditor': {
        const fieldSdk: any = sdk;

        fieldSdk.field = extendedField;

        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <SingleEntryReferenceEditor
              parameters={{ instance: { canCreateEntity: false } }}
              viewType="link"
              sdk={fieldSdk}
            />
          </FieldWrapper>
        );
      }

      case 'entryCardEditor': {
        const fieldSdk: any = sdk;

        fieldSdk.field = extendedField;

        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <SingleEntryReferenceEditor
              parameters={{ instance: { canCreateEntity: false } }}
              viewType="card"
              sdk={fieldSdk}
            />
          </FieldWrapper>
        );
      }

      case 'entryLinksEditor': {
        const fieldSdk: any = sdk;

        fieldSdk.field = extendedField;

        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <MultipleEntryReferenceEditor
              isInitiallyDisabled={false}
              parameters={{ instance: { canCreateEntity: false } }}
              viewType="link"
              sdk={fieldSdk}
            />
          </FieldWrapper>
        );
      }

      case 'entryCardsEditor': {
        const fieldSdk: any = sdk;

        fieldSdk.field = extendedField;

        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <MultipleEntryReferenceEditor
              isInitiallyDisabled={false}
              parameters={{ instance: { canCreateEntity: false } }}
              viewType="card"
              sdk={fieldSdk}
            />
          </FieldWrapper>
        );
      }

      case 'assetLinkEditor': {
        const fieldSdk: any = sdk;

        fieldSdk.field = extendedField;

        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <SingleMediaEditor
              parameters={{ instance: { canCreateEntity: false } }}
              viewType="link"
              sdk={fieldSdk}
            />
          </FieldWrapper>
        );
      }

      case 'assetLinksEditor': {
        const fieldSdk: any = sdk;

        fieldSdk.field = extendedField;

        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <MultipleMediaEditor
              parameters={{ instance: { canCreateEntity: false } }}
              viewType="link"
              sdk={fieldSdk}
            />
          </FieldWrapper>
        );
      }

      case 'assetGalleryEditor': {
        const fieldSdk: any = sdk;

        fieldSdk.field = extendedField;

        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <MultipleMediaEditor
              parameters={{ instance: { canCreateEntity: false } }}
              viewType="card"
              sdk={fieldSdk}
            />
          </FieldWrapper>
        );
      }

      case 'richTextEditor': {
        let fieldSdk: any = sdk;

        fieldSdk.field = extendedField;

        fieldSdk = Object.assign(fieldSdk, {
          parameters: {
            instance: {
              permissions: {
                canAccessAssets: true,
                canCreateAssets: true,
                canCreateEntryOfContentType: () => true
              }
            }
          }
        });

        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <RichTextEditor sdk={sdk} />
          </FieldWrapper>
        );
      }

      case 'markdown': {
        const fieldSdk: any = sdk;

        fieldSdk.field = extendedField;

        const parameters = { instance: { canUploadAssets: false } };
        return (
          <FieldWrapper name={fieldDetails.name} required={fieldDetails.required}>
            <MarkdownEditor sdk={fieldSdk} parameters={parameters} isInitiallyDisabled={false} />
          </FieldWrapper>
        );
      }

      default:
        return (
          <FieldWrapper name={fieldDetails.name} required={false}>
            widget for {fieldDetails.name} of type {fieldEditorInterface.widgetId} was not
            implemented yet
          </FieldWrapper>
        );
    }
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
    <div className={styles.fieldWrapper}>
      <HelpText>
        {name}
        {required ? ' (required)' : ''}
      </HelpText>
      {children}
    </div>
  );
};
