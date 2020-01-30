import React from 'react';
import isHotkey from 'is-hotkey';

import ToolbarIcon from './ToolbarIcon';
import EntityLinkBlock from './EmbeddedEntityBlock';
import { BLOCKS } from '@contentful/rich-text-types';
import { hasBlockOfType, selectEntityAndInsert } from './Util';

export default ToolbarIcon;

export const EmbeddedEntityBlockPlugin = ({
  richTextAPI: { widgetAPI, logShortcutAction, logViewportAction },
  nodeType,
  hotkey
}) => {
  return {
    renderNode: (props, _editor, next) => {
      const { node, attributes, key } = props;
      if (node.type === nodeType) {
        return (
          <EntityLinkBlock
            widgetAPI={widgetAPI}
            {...props}
            {...attributes}
            onEntityFetchComplete={() => logViewportAction('linkRendered', { key })}
          />
        );
      }
      return next();
    },
    onKeyDown(e, editor, next) {
      if (hotkey && isHotkey(hotkey, e)) {
        selectEntityAndInsert(nodeType, widgetAPI, editor, logShortcutAction);
        return;
      }
      if (isHotkey('enter', e)) {
        if (hasBlockOfType(editor, nodeType)) {
          editor.insertBlock(BLOCKS.PARAGRAPH).focus();
          return;
        }
      }
      return next();
    }
  };
};

export const EmbeddedEntryBlockPlugin = ({ richTextAPI }) => {
  return EmbeddedEntityBlockPlugin({
    richTextAPI,
    nodeType: BLOCKS.EMBEDDED_ENTRY,
    hotkey: ['mod+shift+e']
  });
};

export const EmbeddedAssetBlockPlugin = ({ richTextAPI }) => {
  return EmbeddedEntityBlockPlugin({
    richTextAPI,
    nodeType: BLOCKS.EMBEDDED_ASSET,
    hotkey: ['mod+shift+a']
  });
};
