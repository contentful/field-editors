import { SPEditor } from '@udecode/plate-core';
import { ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TD, ELEMENT_TR } from '@udecode/plate-table';

import { isBlockSelected } from '../../helpers/editor';

export function isTableActive(editor: SPEditor) {
  const tableElements = [ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR, ELEMENT_TD];
  return tableElements.some((el) => isBlockSelected(editor, el));
}
