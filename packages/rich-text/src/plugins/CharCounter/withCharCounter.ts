import debounce from 'p-debounce';

import { PlateEditor } from '../../internal';
import { getTextContent } from './utils';

const CHARACTER_COUNT_DEBOUNCE_TIME = 1000;

export const withCharCounter = (editor: PlateEditor) => {
  const { apply } = editor;

  let count: number | undefined;

  editor.getCharacterCount = () => {
    if (count === undefined) {
      count = getTextContent(editor).length;
    }

    return count;
  };

  const recount = debounce(async () => {
    count = getTextContent(editor).length;
  }, CHARACTER_COUNT_DEBOUNCE_TIME);

  editor.apply = (op) => {
    apply(op);

    // Asynchronously redo the character count
    recount();
  };

  return editor;
};
