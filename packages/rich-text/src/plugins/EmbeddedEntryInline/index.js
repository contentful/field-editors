import React from 'react';
import isHotkey from 'is-hotkey';
import { INLINES } from '@contentful/rich-text-types';
import ToolbarIcon from './ToolbarIcon';
import EmbeddedEntryInline from './EmbeddedEntryInline';

import { selectEntryAndInsert, hasOnlyInlineEntryInSelection, canInsertInline } from './Utils';

export default ToolbarIcon;

export const EmbeddedEntryInlinePlugin = ({ richTextAPI: { sdk, logShortcutAction } }) => ({
  renderNode: (props, _editor, next) => {
    const { node, attributes } = props;
    if (node.type === INLINES.EMBEDDED_ENTRY) {
      return <EmbeddedEntryInline sdk={sdk} {...props} {...attributes} />;
    }
    return next();
  },
  onKeyDown: (event, editor, next) => {
    const hotkey = ['mod+shift+2'];
    if (isHotkey(hotkey, event)) {
      if (canInsertInline(editor)) {
        selectEntryAndInsert(sdk, editor, logShortcutAction);
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
