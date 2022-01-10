import { BLOCKS, LIST_ITEM_BLOCKS } from '@contentful/rich-text-types';
import {
  createListPlugin as createPlateListPlugin,
  ELEMENT_LI,
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_LIC,
} from '@udecode/plate-list';

import { transformParagraphs, transformWrapIn } from '../../helpers/transformers';
import { RichTextPlugin } from '../../types';
import { ListOL, ListUL } from './components/List';
import { ListItem } from './components/ListItem';
import {
  isNonEmptyListItem,
  hasListAsDirectParent,
  insertParagraphAsChild,
  normalizeOrphanedListItem,
} from './utils';
import { withList } from './withList';

export const createListPlugin = (): RichTextPlugin =>
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
        // The withList is added on ELEMENT_UL plugin in upstream code
        // so we need to override it here
        withOverrides: withList,
      },
      [ELEMENT_OL]: {
        type: BLOCKS.OL_LIST,
        component: ListOL,
      },
      // ELEMENT_LIC is a child of li, Slate does ul > li > lic + ul
      [ELEMENT_LIC]: {
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
        ],
      },
    },
  } as Partial<RichTextPlugin>);
