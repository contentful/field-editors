import * as React from 'react';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import { NumberEditor } from '@contentful/field-editor-number';
import { SingleLineEditor } from '@contentful/field-editor-single-line';
import { BooleanEditor } from '@contentful/field-editor-boolean';
import { DateEditor } from '@contentful/field-editor-date';
import { LocationEditor } from '@contentful/field-editor-location';
import { JsonEditor } from '@contentful/field-editor-json';
import { MultipleLineEditor } from '@contentful/field-editor-multiple-line';
import { TagsEditor } from '@contentful/field-editor-tags';
import { SlugEditor } from '@contentful/field-editor-slug';
import { DropdownEditor } from '@contentful/field-editor-dropdown';
import { UrlEditor } from '@contentful/field-editor-url';
import { RadioEditor } from '@contentful/field-editor-radio';
import { RatingEditor } from '@contentful/field-editor-rating';
import { CheckboxEditor } from '@contentful/field-editor-checkbox';
import { ListEditor } from '@contentful/field-editor-list';
import {
  SingleEntryReferenceEditor,
  MultipleEntryReferenceEditor,
  SingleMediaEditor,
  MultipleMediaEditor,
} from '@contentful/field-editor-reference';
import { RichTextEditor } from '@contentful/field-editor-rich-text';
import { MarkdownEditor } from '@contentful/field-editor-markdown';
import { FieldAPI, LocalesAPI } from '@contentful/field-editor-shared';

type WidgetType =
  | 'multipleLine'
  | 'boolean'
  | 'objectEditor'
  | 'datePicker'
  | 'locationEditor'
  | 'checkbox'
  | 'listInput'
  | 'rating'
  | 'radio'
  | 'tagEditor'
  | 'numberEditor'
  | 'urlEditor'
  | 'slugEditor'
  | 'singleLine'
  | 'dropdown'
  | 'entryLinkEditor'
  | 'entryCardEditor'
  | 'entryLinksEditor'
  | 'entryCardsEditor'
  | 'assetLinkEditor'
  | 'assetLinksEditor'
  | 'assetGalleryEditor'
  | 'richTextEditor'
  | 'markdown'
  | string;

type FieldProps = {
  sdk: FieldExtensionSDK;
  locales: LocalesAPI;
  widgetId: WidgetType;
  isInitiallyDisabled: boolean;
  renderFieldEditor?: (
    widgetId: WidgetType,
    field: FieldAPI,
    isInitiallyDisabled: boolean
  ) => JSX.Element | false;
};

export const Field: React.FC<FieldProps> = ({
  sdk,
  locales,
  widgetId,
  isInitiallyDisabled,
  renderFieldEditor,
}: FieldProps) => {
  const field = sdk.field;

  if (renderFieldEditor) {
    const customEditor = renderFieldEditor(widgetId, field, isInitiallyDisabled);
    if (customEditor) {
      return customEditor;
    }
  }

  switch (widgetId) {
    case 'multipleLine':
      return (
        <MultipleLineEditor
          field={field}
          locales={locales}
          isInitiallyDisabled={isInitiallyDisabled}
        />
      );
    case 'boolean':
      return <BooleanEditor field={field} isInitiallyDisabled={isInitiallyDisabled} />;
    case 'objectEditor':
      return <JsonEditor field={field} isInitiallyDisabled={isInitiallyDisabled} />;
    case 'datePicker':
      return <DateEditor field={field} isInitiallyDisabled={isInitiallyDisabled} />;
    case 'locationEditor':
      return <LocationEditor field={field} isInitiallyDisabled={isInitiallyDisabled} />;
    case 'checkbox':
      return (
        <CheckboxEditor field={field} locales={locales} isInitiallyDisabled={isInitiallyDisabled} />
      );
    case 'listInput':
      return (
        <ListEditor field={field} locales={locales} isInitiallyDisabled={isInitiallyDisabled} />
      );
    case 'rating':
      return <RatingEditor field={field} isInitiallyDisabled={isInitiallyDisabled} />;
    case 'radio':
      return (
        <RadioEditor field={field} locales={locales} isInitiallyDisabled={isInitiallyDisabled} />
      );
    case 'tagEditor':
      return <TagsEditor field={field} isInitiallyDisabled={isInitiallyDisabled} />;
    case 'numberEditor':
      return <NumberEditor field={field} isInitiallyDisabled={isInitiallyDisabled} />;
    case 'urlEditor':
      return <UrlEditor field={field} isInitiallyDisabled={isInitiallyDisabled} />;
    case 'slugEditor':
      return <SlugEditor field={field} baseSdk={sdk} isInitiallyDisabled={isInitiallyDisabled} />;
    case 'singleLine':
      return (
        <SingleLineEditor
          field={field}
          locales={locales}
          isInitiallyDisabled={isInitiallyDisabled}
        />
      );
    case 'dropdown':
      return (
        <DropdownEditor field={field} locales={locales} isInitiallyDisabled={isInitiallyDisabled} />
      );
    case 'entryLinkEditor': {
      return (
        <SingleEntryReferenceEditor
          viewType="link"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          hasCardEditActions={true}
          parameters={{
            instance: { showCreateEntityAction: true, showLinkEntityAction: true },
          }}
        />
      );
    }
    case 'entryCardEditor': {
      return (
        <SingleEntryReferenceEditor
          viewType="card"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          hasCardEditActions={true}
          parameters={{
            instance: { showCreateEntityAction: true, showLinkEntityAction: true },
          }}
        />
      );
    }
    case 'entryLinksEditor': {
      return (
        <MultipleEntryReferenceEditor
          viewType="link"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          hasCardEditActions={true}
          parameters={{
            instance: { showCreateEntityAction: true, showLinkEntityAction: true },
          }}
        />
      );
    }
    case 'entryCardsEditor': {
      return (
        <MultipleEntryReferenceEditor
          viewType="card"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          hasCardEditActions={true}
          parameters={{
            instance: { showCreateEntityAction: true, showLinkEntityAction: true },
          }}
        />
      );
    }
    case 'assetLinkEditor': {
      return (
        <SingleMediaEditor
          viewType="link"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          parameters={{
            instance: { showCreateEntityAction: true, showLinkEntityAction: true },
          }}
        />
      );
    }
    case 'assetLinksEditor': {
      return (
        <MultipleMediaEditor
          viewType="link"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          parameters={{
            instance: { showCreateEntityAction: true, showLinkEntityAction: true },
          }}
        />
      );
    }
    case 'assetGalleryEditor': {
      return (
        <MultipleMediaEditor
          viewType="card"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          parameters={{
            instance: { showCreateEntityAction: true, showLinkEntityAction: true },
          }}
        />
      );
    }
    case 'richTextEditor': {
      return <RichTextEditor sdk={sdk} isInitiallyDisabled={isInitiallyDisabled} />;
    }
    case 'markdown': {
      return <MarkdownEditor sdk={sdk} isInitiallyDisabled={isInitiallyDisabled} />;
    }
    default:
      return null;
  }
};
