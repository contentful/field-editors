import { PlateEditor } from '../../internal';
import { getTextContent } from './utils';

export const withCharCounter = (editor: PlateEditor) => {
  const { apply } = editor;

  let count: number | undefined;

  editor.getCharacterCount = () => {
    if (count === undefined) {
      count = getTextContent(editor).length;
    }

    return count;
  };

  editor.apply = (op) => {
    // Recount on the next read so renders after content changes use the current value.
    if (op.type !== 'set_selection') {
      count = undefined;
    }

    apply(op);
  };

  return editor;
};
