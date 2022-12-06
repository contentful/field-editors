import { toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import { EMPTY_DOCUMENT, Document } from '@contentful/rich-text-types';
import { createPlateEditor, CreatePlateEditorOptions, TEditor, Value } from '@udecode/plate-core';
import { BaseEditor, Editor, Node, Transforms } from 'slate';

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
  return (doc?.content || []).length > 0;
};

/*
 Plate api doesn't allow to modify (easily) the editor value programmatically
 after the editor instance is created 

 This function is inspired to https://github.com/udecode/plate/issues/1269#issuecomment-1057643622
 */
export const setEditorContent = (editor: TEditor<Value>, nodes?: Node[]): void => {
  // Replaces editor content while keeping change history
  // TODO check this

  Editor.withoutNormalizing(editor as unknown as BaseEditor, () => {
    const children = [...editor.children];
    children.forEach((node) => editor.apply({ type: 'remove_node', path: [0], node }));

    if (nodes) {
      const nodesArray = Node.isNode(nodes) ? [nodes] : nodes;
      // TODO check this

      // @ts-ignore
      nodesArray.forEach((node, i) => editor.apply({ type: 'insert_node', path: [i], node: node }));
    }
    // TODO check this

    // @ts-ignore
    const point = Editor.end(editor, []);
    if (point) {
      // TODO check this

      // @ts-ignore
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

  return sanitizeIncomingSlateDoc(slateDoc) as Value;
};

export const normalizeEditorValue = (
  value: Value,
  options?: CreatePlateEditorOptions<Value, TEditor<Value>>
) => {
  const editor = createPlateEditor(options);
  editor.children = value;
  // TODO make sure this still works
  Editor.normalize(editor as unknown as BaseEditor, { force: true });
  return editor.children;
};
