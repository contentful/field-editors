import React from 'react';
import isHotkey from 'is-hotkey';
import { INLINES } from '@contentful/rich-text-types';
import ToolbarIcon from './ToolbarIcon';
import EmbeddedEntryInline from './EmbeddedEntryInline';

import { selectEntryAndInsert, hasOnlyInlineEntryInSelection, canInsertInline } from './Utils';

export default ToolbarIcon;

export const EmbeddedEntryInlinePlugin = ({
  richTextAPI: { widgetAPI, logShortcutAction, logViewportAction }
}) => ({
  renderNode: (props, _editor, next) => {
    const { node, attributes, key } = props;
    if (node.type === INLINES.EMBEDDED_ENTRY) {
      return (
        <EmbeddedEntryInline
          widgetAPI={widgetAPI}
          {...props}
          {...attributes}
          onEntityFetchComplete={() => logViewportAction('linkRendered', { key })}
        />
      );
    }
    return next();
  },
  onKeyDown: (event, editor, next) => {
    const hotkey = ['mod+shift+2'];
    if (isHotkey(hotkey, event)) {
      if (canInsertInline(editor)) {
        selectEntryAndInsert(widgetAPI, editor, logShortcutAction);
        return;
      }
    }
    if (isHotkey('enter', event)) {
      if (hasOnlyInlineEntryInSelection(editor)) {
        event.preventDefault();
        editor.moveToStartOfNextText();
        return;
      }
    }
    return next();
  }
});
