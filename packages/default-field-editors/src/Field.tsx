import * as React from 'react';
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
import type { FieldExtensionSDK } from '@contentful/field-editor-shared';
import '@contentful/field-editor-date/styles/styles.css';
import '@contentful/field-editor-json/src/codemirrorImports';
import type { WidgetType } from './types';

type FieldProps = {
  sdk: FieldExtensionSDK;
  widgetId: WidgetType;
  isInitiallyDisabled: boolean;
  renderFieldEditor?: (
    widgetId: WidgetType,
    sdk: FieldExtensionSDK,
    isInitiallyDisabled: boolean
  ) => JSX.Element | false;
};

export const Field: React.FC<FieldProps> = ({
  sdk,
  widgetId,
  isInitiallyDisabled,
  renderFieldEditor,
}: FieldProps) => {
  const field = sdk.field;
  const locales = sdk.locales;
  const referenceEditorParams = {
    instance: sdk.parameters?.instance || {
      showCreateEntityAction: true,
      showLinkEntityAction: true,
    },
  };

  if (renderFieldEditor) {
    const customEditor = renderFieldEditor(widgetId, sdk, isInitiallyDisabled);
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
          parameters={referenceEditorParams}
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
          parameters={referenceEditorParams}
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
          parameters={referenceEditorParams}
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
          parameters={referenceEditorParams}
        />
      );
    }
    case 'assetLinkEditor': {
      return (
        <SingleMediaEditor
          viewType="link"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          parameters={referenceEditorParams}
        />
      );
    }
    case 'assetLinksEditor': {
      return (
        <MultipleMediaEditor
          viewType="link"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          parameters={referenceEditorParams}
        />
      );
    }
    case 'assetGalleryEditor': {
      return (
        <MultipleMediaEditor
          viewType="card"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          parameters={referenceEditorParams}
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
