import { toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import { EMPTY_DOCUMENT, Document } from '@contentful/rich-text-types';
import { createPlateEditor, CreatePlateEditorOptions } from '@udecode/plate-core';
import { Descendant, Editor, Node, Transforms } from 'slate';
import { RichTextEditor } from 'types';

import schema from './constants/Schema';
import { sanitizeIncomingSlateDoc } from './helpers/sanitizeIncomingSlateDoc';

/**
 * For legacy reasons, a document may not have any content at all
 * e.g:
 *
 * {nodeType: document, data: {}, content: []}
 *
 * Rendering such document will break the Slate editor
 */
export const hasContent = (doc?: Document) => {
  if (!doc) {
    return false;
  }

  return doc.content.length > 0;
};

/*
 Plate api doesn't allow to modify (easily) the editor value programmatically
 after the editor instance is created 

 This function is inspired to https://github.com/udecode/plate/issues/1269#issuecomment-1057643622
 */
export const setEditorContent = (editor: Editor, nodes?: Node[]): void => {
  // Replaces editor content while keeping change history
  Editor.withoutNormalizing(editor, () => {
    const children = [...editor.children];
    children.forEach((node) => editor.apply({ type: 'remove_node', path: [0], node }));

    if (nodes) {
      const nodesArray = Node.isNode(nodes) ? [nodes] : nodes;
      nodesArray.forEach((node, i) => editor.apply({ type: 'insert_node', path: [i], node: node }));
    }

    const point = Editor.end(editor, []);
    if (point) {
      Transforms.select(editor, point);
    }
  });
};

/**
 * Converts a Contentful rich text document to the corresponding slate editor
 * value
 */
export const documentToEditorValue = (doc: any) => {
  const slateDoc = toSlatejsDocument({
    document: hasContent(doc) ? doc : EMPTY_DOCUMENT,
    // TODO: get rid of schema, https://github.com/contentful/field-editors/pull/1065#discussion_r826723248
    schema,
  });

  return sanitizeIncomingSlateDoc(slateDoc);
};

export const normalizeEditorValue = (
  value: Descendant[],
  options?: Omit<CreatePlateEditorOptions<RichTextEditor>, 'id' | 'editor'>
) => {
  const editor = createPlateEditor(options);
  editor.children = value;
  Editor.normalize(editor, { force: true });
  return editor.children;
};
