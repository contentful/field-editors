import { BLOCKS, MARKS } from '@contentful/rich-text-types';

type JsonObject = Record<string, unknown>;

const knownMarkTypes = new Set<string>(Object.values(MARKS));

const hasOnlyKeys = (value: JsonObject, keys: string[]) =>
  Object.keys(value).every((key) => keys.includes(key));

const isJsonObject = (value: unknown): value is JsonObject =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const hasEmptyData = (value: unknown): value is JsonObject =>
  isJsonObject(value) && Object.keys(value).length === 0;

const isKnownMark = (value: unknown): boolean =>
  isJsonObject(value) &&
  hasOnlyKeys(value, ['type']) &&
  typeof value.type === 'string' &&
  knownMarkTypes.has(value.type);

function isEmptyText(node: unknown): boolean {
  return (
    isJsonObject(node) &&
    hasOnlyKeys(node, ['nodeType', 'value', 'marks', 'data']) &&
    node.nodeType === 'text' &&
    node.value === '' &&
    Array.isArray(node.marks) &&
    node.marks.every(isKnownMark) &&
    hasEmptyData(node.data)
  );
}

function isEmptyParagraph(node: unknown): boolean {
  return (
    isJsonObject(node) &&
    hasOnlyKeys(node, ['nodeType', 'data', 'content']) &&
    node.nodeType === BLOCKS.PARAGRAPH &&
    hasEmptyData(node.data) &&
    Array.isArray(node.content) &&
    node.content.length > 0 &&
    node.content.every(isEmptyText)
  );
}

function isEmptyList(node: unknown): boolean {
  return (
    isJsonObject(node) &&
    hasOnlyKeys(node, ['nodeType', 'data', 'content']) &&
    (node.nodeType === BLOCKS.UL_LIST || node.nodeType === BLOCKS.OL_LIST) &&
    hasEmptyData(node.data) &&
    Array.isArray(node.content) &&
    node.content.every(isEmptyListItem)
  );
}

function isEmptyListItem(node: unknown): boolean {
  return (
    isJsonObject(node) &&
    hasOnlyKeys(node, ['nodeType', 'data', 'content']) &&
    node.nodeType === BLOCKS.LIST_ITEM &&
    hasEmptyData(node.data) &&
    Array.isArray(node.content) &&
    node.content.length > 0 &&
    node.content.every((child) => isEmptyParagraph(child) || isEmptyList(child))
  );
}

/**
 * Returns whether a Rich Text document contains only empty paragraphs and lists.
 *
 * Restricting the empty shapes keeps zero-text content such as embeds, tables,
 * and horizontal rules from being removed with the field value.
 */
export function isEmptyRichTextDocument(value: unknown): boolean {
  return (
    isJsonObject(value) &&
    hasOnlyKeys(value, ['nodeType', 'data', 'content']) &&
    value.nodeType === BLOCKS.DOCUMENT &&
    hasEmptyData(value.data) &&
    Array.isArray(value.content) &&
    value.content.every((node) => isEmptyParagraph(node) || isEmptyList(node))
  );
}
