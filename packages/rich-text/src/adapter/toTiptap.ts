import * as Contentful from '@contentful/rich-text-types';
import { JSONContent } from '@tiptap/core';

import { getDataOrDefault } from './helpers';
import { fromJSON, Schema, SchemaJSON } from './schema';
import { ContentfulNode, ContentfulElementNode } from './types';

export interface ToTiptapDocumentProperties {
  document: Contentful.Document;
  schema?: SchemaJSON;
}

export default function toTiptap({ document }: ToTiptapDocumentProperties): JSONContent {
  return document.content.flatMap((node) => convertNode(node, fromJSON({}))).filter(Boolean);
}

function mapNodeType(cfType: string): string {
  switch (cfType) {
    case Contentful.BLOCKS.LIST_ITEM:
      return 'listItem';
    case Contentful.BLOCKS.UL_LIST:
      return 'bulletList';
    case Contentful.BLOCKS.OL_LIST:
      return 'orderedList';
  }

  return cfType;
}

function convertNode(node: ContentfulNode, schema: Schema) {
  if (node.nodeType === 'text') {
    return convertTextNode(node as Contentful.Text);
  } else {
    const contentfulNode = node as ContentfulElementNode;
    const childNodes = contentfulNode.content
      .flatMap((childNode) => convertNode(childNode, schema))
      .filter(Boolean);
    const slateNode = convertElementNode(contentfulNode, childNodes, schema);
    return slateNode;
  }
}

function convertElementNode(
  contentfulBlock: ContentfulElementNode,
  childNodes: JSONContent,
  schema: Schema
) {
  const content = childNodes;
  return {
    type: mapNodeType(contentfulBlock.nodeType),
    content,
    isVoid: schema.isVoid(contentfulBlock),
    data: getDataOrDefault(contentfulBlock.data),
  };
}

function convertTextNode(node: Contentful.Text) {
  // ProseMirror doesn't allow empty text nodes
  if (node.value === '') {
    return undefined;
  }

  const normalizedMarks =
    node.marks?.map((mark) => {
      if (mark.type === 'bold') {
        mark.data = {
          originalType: mark.type,
        };
        mark.type = 'unknown';
      }
      return mark;
    }) ?? [];

  return {
    type: node.value === '\n' ? 'hardBreak' : 'text',
    text: node.value,
    data: getDataOrDefault(node.data),
    marks: normalizedMarks,
  };
}
