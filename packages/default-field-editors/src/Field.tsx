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

const widgetComponents: Record<string, [React.ComponentType<any>, any?]> = {
  multipleLine: [MultipleLineEditor],
  boolean: [BooleanEditor],
  objectEditor: [JsonEditor],
  datePicker: [DateEditor],
  locationEditor: [LocationEditor],
  checkbox: [CheckboxEditor],
  listInput: [ListEditor],
  rating: [RatingEditor],
  radio: [RadioEditor],
  tagEditor: [TagsEditor],
  numberEditor: [NumberEditor],
  urlEditor: [UrlEditor],
  slugEditor: [SlugEditor],
  singleLine: [SingleLineEditor],
  dropdown: [DropdownEditor],
  entryLinkEditor: [SingleEntryReferenceEditor, { viewType: 'link', hasCardEditActions: true }],
  entryCardEditor: [SingleEntryReferenceEditor, { viewType: 'card', hasCardEditActions: true }],
  entryLinksEditor: [MultipleEntryReferenceEditor, { viewType: 'link', hasCardEditActions: true }],
  entryCardsEditor: [MultipleEntryReferenceEditor, { viewType: 'card', hasCardEditActions: true }],
  assetLinkEditor: [SingleMediaEditor, { viewType: 'link' }],
  assetLinksEditor: [MultipleMediaEditor, { viewType: 'link' }],
  assetGalleryEditor: [MultipleMediaEditor, { viewType: 'card' }],
  richTextEditor: [RichTextEditor],
  markdown: [MarkdownEditor],
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

  if (!widgetComponents[widgetId]) return null;

  const [WidgetComponent, widgetStaticProps] = widgetComponents[widgetId];

  const widgetComponentProps = {
    sdk,
    field,
    locales,
    isInitiallyDisabled,
    parameters: referenceEditorParams,
    ...widgetStaticProps,
    // @ts-expect-error
    ...options[widgetId],
  };

  const baseSdk = widgetId === 'slugEditor' ? sdk : undefined

  return <WidgetComponent key={sdk.field.locale} {...widgetComponentProps} baseSdk={baseSdk} />;
};
