import * as React from 'react';
import { HelpText } from '@contentful/forma-36-react-components';
import { LocalesAPI, FieldAPI } from '@contentful/field-editor-shared';
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
  MultipleMediaEditor,
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
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <MultipleLineEditor field={extendedField} locales={locales} />
          </FieldWrapper>
        );

      case 'boolean':
        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <BooleanEditor field={extendedField} />
          </FieldWrapper>
        );

      case 'objectEditor':
        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <JsonEditor isInitiallyDisabled={false} field={extendedField} />
          </FieldWrapper>
        );

      case 'datePicker':
        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <DateEditor field={extendedField} />
          </FieldWrapper>
        );

      case 'locationEditor':
        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <LocationEditor field={extendedField} />
          </FieldWrapper>
        );

      case 'checkbox':
        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <CheckboxEditor field={extendedField} locales={locales} />
          </FieldWrapper>
        );

      case 'listInput':
        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <ListEditor field={extendedField} locales={locales} />
          </FieldWrapper>
        );

      case 'rating':
        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <RatingEditor field={extendedField} />
          </FieldWrapper>
        );

      case 'radio':
        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <RadioEditor field={extendedField} locales={locales} />
          </FieldWrapper>
        );

      case 'tagEditor':
        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <TagsEditor field={extendedField} />
          </FieldWrapper>
        );

      case 'numberEditor':
        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <NumberEditor field={extendedField} />
          </FieldWrapper>
        );

      case 'urlEditor':
        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <UrlEditor field={extendedField} />
          </FieldWrapper>
        );

      case 'slugEditor':
        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <SlugEditor field={extendedField} baseSdk={sdk} />
          </FieldWrapper>
        );

      case 'singleLine':
        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <SingleLineEditor field={extendedField} locales={locales} />
          </FieldWrapper>
        );

      case 'dropdown':
        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <DropdownEditor field={extendedField} locales={locales} />
          </FieldWrapper>
        );

      case 'entryLinkEditor': {
        const fieldSdk: any = sdk;

        fieldSdk.field = extendedField;

        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <SingleEntryReferenceEditor
              parameters={{
                instance: { showCreateEntityAction: true, showLinkEntityAction: true },
              }}
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
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <SingleEntryReferenceEditor
              parameters={{
                instance: { showCreateEntityAction: true, showLinkEntityAction: true },
              }}
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
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <MultipleEntryReferenceEditor
              isInitiallyDisabled={false}
              parameters={{
                instance: { showCreateEntityAction: true, showLinkEntityAction: true },
              }}
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
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <MultipleEntryReferenceEditor
              isInitiallyDisabled={false}
              parameters={{
                instance: { showCreateEntityAction: true, showLinkEntityAction: true },
              }}
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
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <SingleMediaEditor
              parameters={{
                instance: { showCreateEntityAction: true, showLinkEntityAction: true },
              }}
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
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <MultipleMediaEditor
              parameters={{
                instance: { showCreateEntityAction: true, showLinkEntityAction: true },
              }}
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
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <MultipleMediaEditor
              parameters={{
                instance: { showCreateEntityAction: true, showLinkEntityAction: true },
              }}
              viewType="card"
              sdk={fieldSdk}
            />
          </FieldWrapper>
        );
      }

      case 'richTextEditor': {
        const fieldSdk: any = sdk;
        fieldSdk.field = extendedField;

        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <RichTextEditor sdk={sdk} />
          </FieldWrapper>
        );
      }

      case 'markdown': {
        const fieldSdk: any = sdk;
        fieldSdk.field = extendedField;

        return (
          <FieldWrapper
            field={extendedField}
            name={fieldDetails.name}
            required={fieldDetails.required}>
            <MarkdownEditor sdk={fieldSdk} isInitiallyDisabled={false} />
          </FieldWrapper>
        );
      }

      default:
        return (
          <div>
            widget for {fieldDetails.name} of type {fieldEditorInterface.widgetId} was not
            implemented yet
          </div>
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
  field: FieldAPI;
}
const FieldWrapper: React.FC<FieldWrapperProps> = function ({
  children,
  name,
  required,
  field,
}: FieldWrapperProps) {
  const [errors, setErrors] = React.useState<{ message: string; path: string[] }[]>([]);
  React.useEffect(() => {
    field.onSchemaErrorsChanged((newErrors: { message: string; path: string[] }[]) => {
      if (Array.isArray(newErrors)) {
        setErrors(newErrors);
      } else {
        setErrors([]);
      }
    });
  }, [field, setErrors]);
  return (
    <div className={styles.fieldWrapper}>
      <HelpText>
        {name}
        {required ? ' (required)' : ''}
      </HelpText>

      {children}

      <ul className={styles.errorList}>
        {errors.map((error) => (
          <li key={error.path.join('')} className={styles.error}>
            {error.message}
          </li>
        ))}
      </ul>
    </div>
  );
};
