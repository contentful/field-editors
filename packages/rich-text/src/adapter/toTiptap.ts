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
  return document.content.flatMap((node) => convertNode(node, fromJSON({})));
}

function convertNode(node: ContentfulNode, schema: Schema) {
  if (node.nodeType === 'text') {
    return convertTextNode(node as Contentful.Text);
  } else {
    const contentfulNode = node as ContentfulElementNode;
    const childNodes = contentfulNode.content.flatMap((childNode) =>
      convertNode(childNode, schema)
    );
    const slateNode = convertElementNode(contentfulNode, childNodes, schema);
    return slateNode;
  }
}

function convertElementNode(
  contentfulBlock: ContentfulElementNode,
  childNodes: JSONContent,
  schema: Schema
) {
  const content =
    childNodes.length === 0 && schema.isTextContainer(contentfulBlock.nodeType)
      ? [{ text: '', data: {} }]
      : childNodes;
  return {
    type: contentfulBlock.nodeType,
    content,
    isVoid: schema.isVoid(contentfulBlock),
    data: getDataOrDefault(contentfulBlock.data),
  };
}

function convertTextNode(node: Contentful.Text) {
  return {
    type: 'text',
    text: node.value,
    data: getDataOrDefault(node.data),
    marks: node.marks,
  };
}
