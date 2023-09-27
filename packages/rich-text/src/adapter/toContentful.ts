import { getDataOrDefault } from './helpers';
import { SchemaJSON, Schema, fromJSON } from './schema';
import { JSONContent } from '@tiptap/core';

import * as Contentful from '@contentful/rich-text-types';
import { ContentfulNode, ContentfulElementNode, SlateElement } from './types';

export interface ToContentfulDocumentProperties {
  document: JSONContent;
  schema?: SchemaJSON;
}

export default function toContentfulDocument({
  document,
}: ToContentfulDocumentProperties): Contentful.Document {
  // TODO:
  // We allow adding data to the root document node, but Slate >v0.5.0
  // has no concept of a root document node. We should determine whether
  // this will be a compatibility problem for existing users.
  return {
    nodeType: Contentful.BLOCKS.DOCUMENT,
    data: {},
    content:
      document.content?.flatMap(
        (node) => convertNode(node, fromJSON({})) as Contentful.TopLevelBlock[]
      ) ?? [],
  };
}

function mapNodeType(tiptapType: string): string {
  switch (tiptapType) {
    case 'listItem':
      return Contentful.BLOCKS.LIST_ITEM;
    case 'bulletList':
      return Contentful.BLOCKS.UL_LIST;
    case 'orderedList':
      return Contentful.BLOCKS.OL_LIST;
  }

  return tiptapType;
}

function convertNode(node: JSONContent, schema: Schema): ContentfulNode[] {
  const nodes: ContentfulNode[] = [];
  if (!isLeafNode(node)) {
    let nodeType = mapNodeType(node.type as string) as Contentful.BLOCKS;
    const attrs = { ...node.attrs };
    if (node.type === 'unknownNode') {
      nodeType = attrs.originalType;
      delete attrs.originalType;
    }

    const contentfulElement: ContentfulElementNode = {
      nodeType,
      data: attrs ?? {},
      content: [],
    };
    if (!schema.isVoid(contentfulElement)) {
      contentfulElement.content =
        node.content?.flatMap((childNode) => convertNode(childNode, schema)) ?? [];
    }
    if (contentfulElement.content.length === 0 && schema.isTextContainer(node.type!)) {
      contentfulElement.content.push(convertText({ text: '', data: {} }));
    }
    nodes.push(contentfulElement);
  } else {
    const contentfulText = convertText(node);
    nodes.push(contentfulText);
  }
  return nodes;
}

function convertText(node: JSONContent): Contentful.Text {
  const { type, text = '' } = node;
  const marks =
    node.marks?.map((mark) => {
      let type = mark.type;
      const attrs = { ...mark.attrs };
      if (mark.type === 'unknownMark') {
        type = attrs.originalType;
        delete attrs.originalType;
      }
      return {
        type,
        data: attrs,
      };
    }) ?? [];

  return {
    marks,
    nodeType: 'text',
    value: type === 'hardBreak' ? '\n' : text,
    data: node.attrs ?? {},
  };
}

function isLeafNode(node: JSONContent): node is SlateElement {
  return node.type === 'text' || node.type === 'hardBreak';
}
