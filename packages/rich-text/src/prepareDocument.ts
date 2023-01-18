import { toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import { EMPTY_DOCUMENT, Document } from '@contentful/rich-text-types';

import schema from './constants/Schema';
import { sanitizeIncomingSlateDoc } from './helpers/sanitizeIncomingSlateDoc';
import { createPlateEditor, CreatePlateEditorOptions, withoutNormalizing } from './internal';
import { getEndPoint, isNode } from './internal/queries';
import { normalize, select } from './internal/transforms';
import { Value, PlateEditor, Node } from './internal/types';

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
export const setEditorContent = (editor: PlateEditor, nodes?: Node[]): void => {
  // Replaces editor content while keeping change history
  withoutNormalizing(editor, () => {
    const children = [...editor.children];
    children.forEach((node) => editor.apply({ type: 'remove_node', path: [0], node }));

    if (nodes) {
      const nodesArray = isNode(nodes) ? [nodes] : nodes;
      nodesArray.forEach((node, i) => {
        editor.apply({ type: 'insert_node', path: [i], node });
      });
    }

    const point = getEndPoint(editor, []);
    if (point) {
      select(editor, point);
    }
  });
};

/**
 * Converts a Contentful rich text document to the corresponding slate editor
 * value
 */
export const documentToEditorValue = (doc?: Document) => {
  const slateDoc = toSlatejsDocument({
    document: hasContent(doc) ? doc : EMPTY_DOCUMENT,
    // TODO: get rid of schema, https://github.com/contentful/field-editors/pull/1065#discussion_r826723248
    schema,
  });

  return sanitizeIncomingSlateDoc(slateDoc);
};

export const normalizeEditorValue = (
  value: Value,
  options?: Omit<CreatePlateEditorOptions, 'id' | 'editor'>
) => {
  const editor = createPlateEditor(options);
  editor.children = value;
  normalize(editor, { force: true });
  return editor.children;
};
