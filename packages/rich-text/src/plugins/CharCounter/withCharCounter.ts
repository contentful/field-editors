import { PlateEditor } from '../../internal';
import { getTextContent } from './utils';
import debounce from 'p-debounce';

export const withCharCounter = (editor: PlateEditor) => {
  const { apply } = editor;

  let count = getTextContent(editor).length;
  editor.getCharacterCount = () => count;

  const recount = debounce(async () => {
    count = getTextContent(editor).length;
  }, 300);

  editor.apply = (op) => {
    apply(op);

    // Asynchronously redo the character count
    recount();
  };

  return editor;
};
