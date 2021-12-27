import {
  createListPlugin as createPlateListPlugin,
  ELEMENT_LI,
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_LIC,
} from '@udecode/plate-list';
import { BLOCKS, CONTAINERS, LIST_ITEM_BLOCKS } from '@contentful/rich-text-types';
import { RichTextPlugin } from '../../types';
import { transformText } from '../../helpers/transformers';
import { withList } from './withList';
import {
  wrapInAListItem,
  isEmptyListItem,
  hasListAsDirectParent,
  insertParagraphAsChild,
  normalizeOrphanedListItem,
} from './utils';
import { ListOL, ListUL } from './components/List';
import { ListItem } from './components/ListItem';

export const createListPlugin = (): RichTextPlugin =>
  createPlateListPlugin({
    options: {
      validLiChildrenTypes: LIST_ITEM_BLOCKS,
    },
    normalizer: [
      {
        match: {
          type: [BLOCKS.UL_LIST, BLOCKS.OL_LIST],
        },
        validChildren: [BLOCKS.LIST_ITEM],
        transform: wrapInAListItem,
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
            validNode: (editor, entry) => !isEmptyListItem(editor, entry),
            transform: insertParagraphAsChild,
          },
          {
            validChildren: CONTAINERS[BLOCKS.LIST_ITEM],
            transform: transformText,
          },
        ],
      },
    } as Record<string, Partial<RichTextPlugin>>,
  } as Partial<RichTextPlugin>);
