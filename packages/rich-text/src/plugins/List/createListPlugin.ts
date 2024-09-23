import { BLOCKS, LIST_ITEM_BLOCKS } from '@contentful/rich-text-types';
import {
  createListPlugin as createPlateListPlugin,
  ELEMENT_LI,
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_LIC,
} from '@udecode/plate-list';

import { transformParagraphs, transformWrapIn } from '../../helpers/transformers';
import { PlatePlugin, PlateEditor, Value } from '../../internal/types';
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
  createPlateListPlugin<any, Value, PlateEditor>({
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
        type: BLOCKS.PARAGRAPH,
      },
      [ELEMENT_LI]: {
        type: BLOCKS.LIST_ITEM,
        component: ListItem,
        // @ts-expect-error
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
            validNode: firstNodeIsNotList,
            transform: replaceNodeWithListItems,
          },
        ],
      },
    },
  });
