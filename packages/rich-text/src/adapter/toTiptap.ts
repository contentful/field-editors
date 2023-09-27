import * as Contentful from '@contentful/rich-text-types';
import { JSONContent, getSchema } from '@tiptap/core';

import { getDataOrDefault } from './helpers';
import { fromJSON, Schema, SchemaJSON } from './schema';
import { ContentfulNode, ContentfulElementNode } from './types';

export interface ToTiptapDocumentProperties {
  document: Contentful.Document;
  schema?: SchemaJSON;
  tiptapSchema?: ReturnType<typeof getSchema>;
}

export default function toTiptap({
  document,
  tiptapSchema,
}: ToTiptapDocumentProperties): JSONContent {
  return document.content
    .flatMap((node) => convertNode(node, fromJSON({}), tiptapSchema))
    .filter(Boolean);
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

function convertNode(
  node: ContentfulNode,
  schema: Schema,
  tiptapSchema: ReturnType<typeof getSchema>
) {
  if (node.nodeType === 'text') {
    return convertTextNode(node as Contentful.Text, tiptapSchema);
  } else {
    const contentfulNode = node as ContentfulElementNode;
    const childNodes = contentfulNode.content
      .flatMap((childNode) => convertNode(childNode, schema, tiptapSchema))
      .filter(Boolean);
    const slateNode = convertElementNode(contentfulNode, childNodes, schema, tiptapSchema);
    return slateNode;
  }
}

function convertElementNode(
  contentfulBlock: ContentfulElementNode,
  childNodes: JSONContent,
  schema: Schema,
  tiptapSchema: ReturnType<typeof getSchema>
) {
  const content = childNodes;

  let type = mapNodeType(contentfulBlock.nodeType);
  const attrs = {};

  // if the node is not in the tiptap schema we use unknownNode as a fallback
  if (tiptapSchema.nodes[contentfulBlock.nodeType] === undefined) {
    type = 'unknownNode';
    attrs.originalType = contentfulBlock.nodeType;
  }

  return {
    type,
    content,
    isVoid: schema.isVoid(contentfulBlock),
    data: getDataOrDefault(contentfulBlock.data),
    attrs,
  };
}

function convertTextNode(node: Contentful.Text, tiptapSchema: ReturnType<typeof getSchema>) {
  // ProseMirror doesn't allow empty text nodes
  if (node.value === '') {
    return undefined;
  }

  const normalizedMarks =
    node.marks?.map((mark) => {
      // if the mark is not in the tiptap schema we use unknownMark as a fallback
      if (tiptapSchema.marks[mark.type] === undefined) {
        mark.data = {
          originalType: mark.type,
        };
        mark.type = 'unknownMark';
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
