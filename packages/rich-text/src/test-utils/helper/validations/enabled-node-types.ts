/* eslint-disable */
import _ from 'lodash';

import { Block, BLOCKS, Inline, Text } from '@contentful/rich-text-types';
import { Validation } from '../validation';

const DEFAULT_ENABLED_NODE_TYPES = [BLOCKS.DOCUMENT, BLOCKS.PARAGRAPH, 'text'];

export function enabledNodeTypes(params: string[]): Validation {
  if (!_.isArray(params)) {
    throw new Error('Expected Array<String> as enabledNodeTypes validation argument');
  }

  const enabledNodeTypes = [...params, ...DEFAULT_ENABLED_NODE_TYPES];

  if (
    _.includes(enabledNodeTypes, BLOCKS.UL_LIST) ||
    _.includes(enabledNodeTypes, BLOCKS.OL_LIST)
  ) {
    enabledNodeTypes.push(BLOCKS.LIST_ITEM);
  }

  if (_.includes(enabledNodeTypes, BLOCKS.TABLE)) {
    enabledNodeTypes.push(BLOCKS.TABLE_ROW);
    enabledNodeTypes.push(BLOCKS.TABLE_CELL);
    enabledNodeTypes.push(BLOCKS.TABLE_HEADER_CELL);
  }

  const test = function hasOnlyEnabledNodeTypes(rootNode: Block | Inline | Text): boolean {
    if (!_.isArray((rootNode as Block | Inline)?.content)) {
      // This should fail elsewhere, but it's not strictly speaking
      // an "enabled node types" failure, hence we shoudn't flag it.
      return true;
    }

    for (const childNode of (rootNode as Block | Inline).content) {
      if (
        childNode &&
        (!enabledNodeTypes.includes(childNode.nodeType) || !hasOnlyEnabledNodeTypes(childNode))
      ) {
        return false;
      }
    }
    return true;
  };

  return Validation.fromTestFunction('enabledNodeTypes', test);
}
