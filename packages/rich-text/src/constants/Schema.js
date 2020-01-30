import { fromPairs } from 'lodash';
import {
  BLOCKS,
  INLINES,
  TOP_LEVEL_BLOCKS,
  VOID_BLOCKS,
  CONTAINERS
} from '@contentful/rich-text-types';

import ListPlugin from '../plugins/List/EditListWrapper';

const mapVoidTypes = nodeTypes => {
  return fromPairs(nodeTypes.map(nodeType => [nodeType, { isVoid: true }]));
};

const listPlugin = ListPlugin();

export default {
  document: {
    nodes: [
      {
        types: TOP_LEVEL_BLOCKS
      }
    ]
  },
  blocks: {
    [BLOCKS.PARAGRAPH]: {
      nodes: [
        {
          types: Object.values(INLINES)
        },
        {
          objects: ['text', 'inline']
        }
      ]
    },
    [BLOCKS.HEADING_1]: {
      nodes: [
        {
          types: Object.values(INLINES)
        },
        {
          objects: ['text', 'inline']
        }
      ]
    },
    [BLOCKS.HEADING_2]: {
      nodes: [
        {
          types: Object.values(INLINES)
        },
        {
          objects: ['text', 'inline']
        }
      ]
    },
    [BLOCKS.HEADING_3]: {
      nodes: [
        {
          types: Object.values(INLINES)
        },
        {
          objects: ['text', 'inline']
        }
      ]
    },
    [BLOCKS.HEADING_4]: {
      nodes: [
        {
          types: Object.values(INLINES)
        },
        {
          objects: ['text', 'inline']
        }
      ]
    },
    [BLOCKS.HEADING_5]: {
      nodes: [
        {
          types: Object.values(INLINES)
        },
        {
          objects: ['text', 'inline']
        }
      ]
    },
    [BLOCKS.HEADING_6]: {
      nodes: [
        {
          types: Object.values(INLINES)
        },
        {
          objects: ['text', 'inline']
        }
      ]
    },
    ...mapVoidTypes(VOID_BLOCKS),
    // The schema for the lists and list-items is defined in the slate-edit-list plugin.
    // Due to the bug in slate@0.44.9 we have to stitch the schema manually.
    // Related bug ticket AUTH-888
    ...listPlugin.schema.blocks,
    [BLOCKS.QUOTE]: {
      nodes: [
        {
          match: [CONTAINERS[BLOCKS.QUOTE].map(type => ({ type }))],
          min: 1
        }
      ],
      normalize: (editor, error) => {
        if (error.code === 'child_type_invalid') {
          return editor.unwrapBlockByKey(error.node.key, BLOCKS.QUOTE);
        }
      }
    }
  },
  inlines: {
    [INLINES.HYPERLINK]: {
      nodes: [
        {
          objects: ['text']
        }
      ]
    },
    [INLINES.ENTRY_HYPERLINK]: {
      nodes: [
        {
          objects: ['text']
        }
      ]
    },
    [INLINES.ASSET_HYPERLINK]: {
      nodes: [
        {
          objects: ['text']
        }
      ]
    },
    [INLINES.EMBEDDED_ENTRY]: {
      isVoid: true
    }
  }
};
