import { BooleanEditor } from '@contentful/field-editor-boolean';
import { CheckboxEditor } from '@contentful/field-editor-checkbox';
import { DateEditor } from '@contentful/field-editor-date';
import { DropdownEditor } from '@contentful/field-editor-dropdown';
import { JsonEditor } from '@contentful/field-editor-json';
import { ListEditor } from '@contentful/field-editor-list';
import { LocationEditor } from '@contentful/field-editor-location';
import { MarkdownEditor } from '@contentful/field-editor-markdown';
import { MultipleLineEditor } from '@contentful/field-editor-multiple-line';
import { NumberEditor } from '@contentful/field-editor-number';
import { RadioEditor } from '@contentful/field-editor-radio';
import { RatingEditor } from '@contentful/field-editor-rating';
import {
  MultipleEntryReferenceEditor,
  MultipleMediaEditor,
  SingleEntryReferenceEditor,
  SingleMediaEditor,
} from '@contentful/field-editor-reference';
import { RichTextEditor } from '@contentful/field-editor-rich-text';
import { SingleLineEditor } from '@contentful/field-editor-single-line';
import { SlugEditor } from '@contentful/field-editor-slug';
import { TagsEditor } from '@contentful/field-editor-tags';
import { UrlEditor } from '@contentful/field-editor-url';

export type WidgetType =
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

export type EditorOptions = {
  multipleLine?: Partial<Parameters<typeof MultipleLineEditor>[0]>;
  boolean?: Partial<Parameters<typeof BooleanEditor>[0]>;
  entryCardEditor?: Partial<Parameters<typeof SingleEntryReferenceEditor>[0]>;
  objectEditor?: Partial<Parameters<typeof JsonEditor>[0]>;
  datePicker?: Partial<Parameters<typeof DateEditor>[0]>;
  locationEditor?: Partial<Parameters<typeof LocationEditor>[0]>;
  checkbox?: Partial<Parameters<typeof CheckboxEditor>[0]>;
  listInput?: Partial<Parameters<typeof ListEditor>[0]>;
  rating?: Partial<Parameters<typeof RatingEditor>[0]>;
  radio?: Partial<Parameters<typeof RadioEditor>[0]>;
  tagEditor?: Partial<Parameters<typeof TagsEditor>[0]>;
  numberEditor?: Partial<Parameters<typeof NumberEditor>[0]>;
  urlEditor?: Partial<Parameters<typeof UrlEditor>[0]>;
  slugEditor?: Partial<Parameters<typeof SlugEditor>[0]>;
  singleLine?: Partial<Parameters<typeof SingleLineEditor>[0]>;
  dropdown?: Partial<Parameters<typeof DropdownEditor>[0]>;
  entryLinkEditor?: Partial<Parameters<typeof SingleEntryReferenceEditor>[0]>;
  entryLinksEditor?: Partial<Parameters<typeof MultipleEntryReferenceEditor>[0]>;
  entryCardsEditor?: Partial<Parameters<typeof MultipleEntryReferenceEditor>[0]>;
  assetLinkEditor?: Partial<Parameters<typeof SingleMediaEditor>[0]>;
  assetLinksEditor?: Partial<Parameters<typeof MultipleMediaEditor>[0]>;
  assetGalleryEditor?: Partial<Parameters<typeof MultipleMediaEditor>[0]>;
  richTextEditor?: Partial<Parameters<typeof RichTextEditor>[0]>;
  markdown?: Partial<Parameters<typeof MarkdownEditor>[0]>;
};
