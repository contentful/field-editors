import { BLOCKS } from '@contentful/rich-text-types';
import EditList from '@productboard/slate-edit-list';

export default opt => {
  const config = {
    types: [BLOCKS.OL_LIST, BLOCKS.UL_LIST],
    typeItem: BLOCKS.LIST_ITEM,
    typeDefault: BLOCKS.PARAGRAPH,
    ...opt
  };

  const plugin = EditList(config);

  return plugin;
};
