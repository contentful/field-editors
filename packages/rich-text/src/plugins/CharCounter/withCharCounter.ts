import type { PlateEditor } from 'internal';
import { Node } from 'slate';

export const withCharCounter = (editor: PlateEditor) => {
  const { apply } = editor;

  // Note: The count has to be lazily initialized as the editor instance
  // has no content at this point so calling editor.string([]) would throw
  // an error
  let count: number;

  const getInitialCount = () => {
    return editor.string([]).length;
  };

  const updateCount = (value: number) => {
    count = count ?? getInitialCount();
    count += value;
  };

  editor.getCharacterCount = () => {
    return count ?? getInitialCount();
  };

  editor.apply = (op) => {
    switch (op.type) {
      case 'insert_text':
        updateCount(op.text.length);
        break;

      case 'remove_text':
        updateCount(-op.text.length);
        break;

      case 'insert_node':
        updateCount(Node.string(op.node).length);
        break;

      case 'remove_node':
        updateCount(-Node.string(op.node).length);
        break;

      default:
        console.log({ op });
        break;
    }

    apply(op);
  };

  return editor;
};
