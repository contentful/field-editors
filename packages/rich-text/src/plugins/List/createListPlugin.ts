import { BLOCKS, LIST_ITEM_BLOCKS } from '@contentful/rich-text-types';

import { transformParagraphs, transformWrapIn } from '../../helpers/transformers';
import { ELEMENT_LI, ELEMENT_UL, ELEMENT_OL, ELEMENT_LIC } from '../../internal/list';
import { createListPlugin as createPlateListPlugin } from '../../internal/pluginFactories';
import { PlatePlugin } from '../../internal/types';
import { Paragraph } from '../Paragraph/Paragraph';
import { ListOL, ListUL } from './components/List';
import { ListItem } from './components/ListItem';
import { onKeyDownList } from './onKeyDownList';
import {
  isNonEmptyListItem,
  hasListAsDirectParent,
  insertParagraphAsChild,
  normalizeOrphanedListItem,
  firstNodeIsNotList,
  replaceNodeWithListItems,
} from './utils';
import { withList } from './withList';

export const createListPlugin = (): PlatePlugin =>
  createPlateListPlugin({
    normalizer: [
      {
        match: {
          type: [BLOCKS.UL_LIST, BLOCKS.OL_LIST],
        },
        validChildren: [BLOCKS.LIST_ITEM],
        transform: transformWrapIn(BLOCKS.LIST_ITEM),
      },
    ],
    overrideByKey: {
      [ELEMENT_UL]: {
        type: BLOCKS.UL_LIST,
        component: ListUL,
        handlers: {
          onKeyDown: onKeyDownList,
        },
        // The withList is added on ELEMENT_UL plugin in upstream code
        // so we need to override it here
        withOverrides: withList,
      },
      [ELEMENT_OL]: {
        type: BLOCKS.OL_LIST,
        component: ListOL,
        handlers: {
          onKeyDown: onKeyDownList,
        },
      },
      // ELEMENT_LIC is a child of li, Slate does ul > li > lic + ul
      [ELEMENT_LIC]: {
        component: Paragraph,
        type: BLOCKS.PARAGRAPH,
      },
      [ELEMENT_LI]: {
        type: BLOCKS.LIST_ITEM,
        component: ListItem,
        normalizer: [
          {
            validNode: hasListAsDirectParent,
            transform: normalizeOrphanedListItem,
          },
          {
            validNode: isNonEmptyListItem,
            transform: insertParagraphAsChild,
          },
          {
            validChildren: LIST_ITEM_BLOCKS,
            transform: transformParagraphs,
          },
          {
            validNode: (editor, entry) =>
              firstNodeIsNotList(editor, entry as Parameters<typeof firstNodeIsNotList>[1]),
            transform: (editor, entry) =>
              replaceNodeWithListItems(
                editor,
                entry as Parameters<typeof replaceNodeWithListItems>[1],
              ),
          },
        ],
      },
    },
  });
