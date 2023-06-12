import { toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import { EMPTY_DOCUMENT, Document } from '@contentful/rich-text-types';

import schema from '../constants/Schema';
import { Element, Text, Node } from '../internal/types';

const isTextElement = (node: Node): node is Text => 'text' in node;

/**
 * Ensures all nodes have a child leaf text element. This should be handled by
 * Slate but its behavior has proven to be buggy and unpredictable.
 */
function sanitizeIncomingSlateDoc(nodes: Node[] = []): Node[] {
  return nodes.map((node: Node): Node => {
    if (isTextElement(node)) {
      return node;
    }
    if ((node.children as Node[])?.length === 0) {
      return {
        ...node,
        children: [{ text: '', data: {} }],
      };
    }
    return {
      ...node,
      children: sanitizeIncomingSlateDoc(node?.children as Node[]),
    };
  });
}

/**
 * Converts a Contentful rich text document to the corresponding slate editor
 * value
 */
export const toSlateValue = (doc?: Document): Element[] => {
  /**
   * For legacy reasons, a document may not have any content at all
   * e.g:
   *
   * {nodeType: document, data: {}, content: []}
   *
   * Rendering such document will break the Slate editor
   */
  const hasContent = (doc?: Document) => {
    return (doc?.content || []).length > 0;
  };

  const slateDoc = toSlatejsDocument({
    document: doc && hasContent(doc) ? doc : EMPTY_DOCUMENT,
    // TODO: get rid of schema, https://github.com/contentful/field-editors/pull/1065#discussion_r826723248
    schema,
  });

  return sanitizeIncomingSlateDoc(slateDoc) as Element[];
};
