import React, { Suspense, lazy, type FC, type ComponentType } from 'react';

import type { FieldAppSDK } from '@contentful/field-editor-shared';

import { getDefaultWidgetId } from './getDefaultWidgetId';
import type { EditorOptions, WidgetType } from './types';

type FieldProps = {
  sdk: FieldAppSDK;
  widgetId?: WidgetType;
  isInitiallyDisabled?: boolean;
  renderFieldEditor?: (
    widgetId: WidgetType,
    sdk: FieldAppSDK,
    isInitiallyDisabled: boolean,
  ) => JSX.Element | false;
  getOptions?: (widgetId: WidgetType, sdk: FieldAppSDK) => EditorOptions;
};
const widgetComponents: Record<string, [ComponentType<any>, any?]> = {
  multipleLine: [
    lazy(() =>
      import('@contentful/field-editor-multiple-line').then((mod) => ({
        default: mod.MultipleLineEditor,
      })),
    ),
  ],
  boolean: [
    lazy(() =>
      import('@contentful/field-editor-boolean').then((mod) => ({
        default: mod.BooleanEditor,
      })),
    ),
  ],
  objectEditor: [
    lazy(() =>
      import('@contentful/field-editor-json').then((mod) => ({
        default: mod.JsonEditor,
      })),
    ),
  ],
  datePicker: [
    lazy(() =>
      import('@contentful/field-editor-date').then((mod) => ({
        default: mod.DateEditor,
      })),
    ),
  ],
  locationEditor: [
    lazy(() =>
      import('@contentful/field-editor-location').then((mod) => ({
        default: mod.LocationEditor,
      })),
    ),
  ],
  checkbox: [
    lazy(() =>
      import('@contentful/field-editor-checkbox').then((mod) => ({
        default: mod.CheckboxEditor,
      })),
    ),
  ],
  listInput: [
    lazy(() =>
      import('@contentful/field-editor-list').then((mod) => ({
        default: mod.ListEditor,
      })),
    ),
  ],
  rating: [
    lazy(() =>
      import('@contentful/field-editor-rating').then((mod) => ({
        default: mod.RatingEditor,
      })),
    ),
  ],
  radio: [
    lazy(() =>
      import('@contentful/field-editor-radio').then((mod) => ({
        default: mod.RadioEditor,
      })),
    ),
  ],
  tagEditor: [
    lazy(() =>
      import('@contentful/field-editor-tags').then((mod) => ({
        default: mod.TagsEditor,
      })),
    ),
  ],
  numberEditor: [
    lazy(() =>
      import('@contentful/field-editor-number').then((mod) => ({
        default: mod.NumberEditor,
      })),
    ),
  ],
  urlEditor: [
    lazy(() =>
      import('@contentful/field-editor-url').then((mod) => ({
        default: mod.UrlEditor,
      })),
    ),
  ],
  slugEditor: [
    lazy(() =>
      import('@contentful/field-editor-slug').then((mod) => ({
        default: mod.SlugEditor,
      })),
    ),
  ],
  singleLineEditor: [
    lazy(() =>
      import('@contentful/field-editor-single-line').then((mod) => ({
        default: mod.SingleLineEditor,
      })),
    ),
  ],
  dropdown: [
    lazy(() =>
      import('@contentful/field-editor-dropdown').then((mod) => ({
        default: mod.DropdownEditor,
      })),
    ),
  ],
  entryLinkEditor: [
    lazy(() =>
      import('@contentful/field-editor-reference').then((mod) => ({
        default: mod.SingleEntryReferenceEditor,
      })),
    ),
    { viewType: 'link', hasCardEditActions: true },
  ],
  entryCardEditor: [
    lazy(() =>
      import('@contentful/field-editor-reference').then((mod) => ({
        default: mod.SingleEntryReferenceEditor,
      })),
    ),
    { viewType: 'card', hasCardEditActions: true },
  ],
  entryLinksEditor: [
    lazy(() =>
      import('@contentful/field-editor-reference').then((mod) => ({
        default: mod.MultipleEntryReferenceEditor,
      })),
    ),
    { viewType: 'link', hasCardEditActions: true },
  ],
  entryCardsEditor: [
    lazy(() =>
      import('@contentful/field-editor-reference').then((mod) => ({
        default: mod.MultipleEntryReferenceEditor,
      })),
    ),
    { viewType: 'card', hasCardEditActions: true },
  ],
  assetLinkEditor: [
    lazy(() =>
      import('@contentful/field-editor-reference').then((mod) => ({
        default: mod.SingleMediaEditor,
      })),
    ),
    { viewType: 'link' },
  ],
  assetLinksEditor: [
    lazy(() =>
      import('@contentful/field-editor-reference').then((mod) => ({
        default: mod.MultipleMediaEditor,
      })),
    ),
    { viewType: 'link' },
  ],
  assetGalleryEditor: [
    lazy(() =>
      import('@contentful/field-editor-reference').then((mod) => ({
        default: mod.MultipleMediaEditor,
      })),
    ),
    { viewType: 'card' },
  ],
  richTextEditor: [
    lazy(() =>
      import('@contentful/field-editor-rich-text').then((mod) => ({
        default: mod.RichTextEditor,
      })),
    ),
  ],
  markdown: [
    lazy(() =>
      import('@contentful/field-editor-markdown').then((mod) => ({
        default: mod.MarkdownEditor,
      })),
    ),
  ],
};

export const Field: FC<FieldProps> = (props: FieldProps) => {
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

  return (
    <Suspense fallback={null}>
      <WidgetComponent key={sdk.field.locale} {...widgetComponentProps} baseSdk={baseSdk} />;
    </Suspense>
  );
};
