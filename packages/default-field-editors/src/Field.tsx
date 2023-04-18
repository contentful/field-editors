import * as React from 'react';

import { BooleanEditor } from '@contentful/field-editor-boolean';
import { RadioEditor } from '@contentful/field-editor-radio';
import { RatingEditor } from '@contentful/field-editor-rating';
import { CheckboxEditor } from '@contentful/field-editor-checkbox';
import { DateEditor } from '@contentful/field-editor-date';
import { DropdownEditor } from '@contentful/field-editor-dropdown';
import { JsonEditor } from '@contentful/field-editor-json';
import { ListEditor } from '@contentful/field-editor-list';
import { LocationEditor } from '@contentful/field-editor-location';
import { MarkdownEditor } from '@contentful/field-editor-markdown';
import { MultipleLineEditor } from '@contentful/field-editor-multiple-line';
import { NumberEditor } from '@contentful/field-editor-number';
import {
  SingleEntryReferenceEditor,
  MultipleEntryReferenceEditor,
  SingleMediaEditor,
  MultipleMediaEditor,
} from '@contentful/field-editor-reference';
import { RichTextEditor } from '@contentful/field-editor-rich-text';
import type { FieldExtensionSDK } from '@contentful/field-editor-shared';
import { SingleLineEditor } from '@contentful/field-editor-single-line';
import { SlugEditor } from '@contentful/field-editor-slug';
import { TagsEditor } from '@contentful/field-editor-tags';
import { UrlEditor } from '@contentful/field-editor-url';

import { getDefaultWidgetId } from './getDefaultWidgetId';
import type { EditorOptions, WidgetType } from './types';

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

  const baseSdk = widgetId === 'slugEditor' ? sdk : undefined;

  return <WidgetComponent key={sdk.field.locale} {...widgetComponentProps} baseSdk={baseSdk} />;
};
