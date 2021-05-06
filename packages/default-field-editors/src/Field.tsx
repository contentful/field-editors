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
import type { EditorOptions, WidgetType } from './types';
import { getDefaultWidgetId } from './getDefaultWidgetId';

type FieldProps = {
  sdk: FieldExtensionSDK;
  widgetId?: WidgetType;
  isInitiallyDisabled?: boolean;
  renderFieldEditor?: (
    widgetId: WidgetType,
    sdk: FieldExtensionSDK,
    isInitiallyDisabled: boolean
  ) => JSX.Element | false;
  getOptions?: (widgetId: WidgetType, sdk: FieldExtensionSDK) => EditorOptions;
};

export const Field: React.FC<FieldProps> = (props: FieldProps) => {
  const {
    sdk,
    widgetId: possiblyUndefinedWidgetId,
    isInitiallyDisabled = false,
    renderFieldEditor,
    getOptions,
  } = props;
  const field = sdk.field;
  const locales = sdk.locales;

  const widgetId = possiblyUndefinedWidgetId ?? getDefaultWidgetId(sdk);

  if (renderFieldEditor) {
    const customEditor = renderFieldEditor(widgetId, sdk, isInitiallyDisabled);
    if (customEditor) {
      return customEditor;
    }
  }

  const options = getOptions ? getOptions(widgetId, sdk) : {};
  const referenceEditorParams =
    sdk.parameters && 'instance' in sdk.parameters
      ? sdk.parameters
      : {
          instance: {
            showCreateEntityAction: true,
            showLinkEntityAction: true,
          },
        };

  switch (widgetId) {
    case 'multipleLine':
      return (
        <MultipleLineEditor
          field={field}
          locales={locales}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    case 'boolean':
      return (
        <BooleanEditor
          field={field}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    case 'objectEditor':
      return (
        <JsonEditor
          field={field}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    case 'datePicker':
      return (
        <DateEditor
          field={field}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    case 'locationEditor':
      return (
        <LocationEditor
          field={field}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    case 'checkbox':
      return (
        <CheckboxEditor
          field={field}
          locales={locales}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    case 'listInput':
      return (
        <ListEditor
          field={field}
          locales={locales}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    case 'rating':
      return (
        <RatingEditor
          field={field}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    case 'radio':
      return (
        <RadioEditor
          field={field}
          locales={locales}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    case 'tagEditor':
      return (
        <TagsEditor
          field={field}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    case 'numberEditor':
      return (
        <NumberEditor
          field={field}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    case 'urlEditor':
      return (
        <UrlEditor field={field} isInitiallyDisabled={isInitiallyDisabled} {...options[widgetId]} />
      );
    case 'slugEditor':
      return (
        <SlugEditor
          field={field}
          baseSdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    case 'singleLine':
      return (
        <SingleLineEditor
          field={field}
          locales={locales}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    case 'dropdown':
      return (
        <DropdownEditor
          field={field}
          locales={locales}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    case 'entryLinkEditor': {
      return (
        <SingleEntryReferenceEditor
          viewType="link"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          hasCardEditActions={true}
          parameters={referenceEditorParams}
          {...options[widgetId]}
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
          {...options[widgetId]}
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
          {...options[widgetId]}
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
          {...options[widgetId]}
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
          {...options[widgetId]}
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
          {...options[widgetId]}
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
          {...options[widgetId]}
        />
      );
    }
    case 'richTextEditor': {
      return (
        <RichTextEditor
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    }
    case 'markdown': {
      return (
        <MarkdownEditor
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          {...options[widgetId]}
        />
      );
    }
    default:
      return null;
  }
};
