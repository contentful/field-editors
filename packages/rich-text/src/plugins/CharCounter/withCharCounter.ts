import debounce from 'p-debounce';

import { PlateEditor } from '../../internal';
import type { PluginConfig } from '../../internal/plate';
import { getTextContent } from './utils';

export type CharCounterConfig = PluginConfig<'char-counter', { count: number | undefined }>;

const CHARACTER_COUNT_DEBOUNCE_TIME = 300;

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
    editor.setOption<CharCounterConfig, 'count'>({ key: 'char-counter' }, 'count', count);
  }, CHARACTER_COUNT_DEBOUNCE_TIME);

  editor.apply = (op) => {
    apply(op);

    if (op.type !== 'set_selection') {
      recount();
    }
  };

  return editor;
};
