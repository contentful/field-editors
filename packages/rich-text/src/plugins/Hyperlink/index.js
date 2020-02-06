import React from 'react';
import isHotkey from 'is-hotkey';
import _ from 'lodash-es';
import { INLINES } from '@contentful/rich-text-types';
import ToolbarIcon from './ToolbarIcon';
import Hyperlink from './Hyperlink';
import { editLink, mayEditLink, toggleLink, hasOnlyHyperlinkInlines } from './Util';

import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

// TODO:xxx Inject from web-app.
//import { ScheduleTooltipContent } from 'app/ScheduledActions/EntrySidebarWidget/ScheduledActionsTimeline/ScheduleTooltip';
function ScheduleTooltipContent() {
  return <div>TODO</div>;
}

const { HYPERLINK, ENTRY_HYPERLINK, ASSET_HYPERLINK } = INLINES;

const styles = {
  tooltipSeparator: css({
    background: tokens.colorTextMid,
    margin: tokens.spacingXs
  })
};

export default ToolbarIcon;

export const HyperlinkPlugin = ({ richTextAPI }) => ({
  renderNode: (props, _editor, next) => {
    const { widgetAPI, logViewportAction, customRenderers } = richTextAPI;
    const { renderEntityHyperlinkTooltip } = customRenderers;
    const { node, editor, key } = props;
    if (isHyperlink(node.type)) {
      return (
        <Hyperlink
          {...props}
          onClick={event => {
            event.preventDefault(); // Don't follow `href`

            editor.moveToRangeOfNode(node).focus();
            if (mayEditLink(editor.value)) {
              editLink(editor, widgetAPI.dialogs.createHyperlink, logViewportAction);
            }
          }}
          onEntityFetchComplete={() => logViewportAction('linkRendered', { key })}
          renderEntityHyperlinkTooltip={renderEntityHyperlinkTooltip}
        />
      );
    }
    return next();
  },
  onKeyDown: (event, editor, next) => {
    const { widgetAPI, logShortcutAction } = richTextAPI;
    const hotkey = ['mod+k'];

    if (isHotkey(hotkey, event) && hasOnlyHyperlinkInlines(editor.value)) {
      if (mayEditLink(editor.value)) {
        editLink(editor, widgetAPI.dialogs.createHyperlink, logShortcutAction);
      } else {
        toggleLink(editor, widgetAPI.dialogs.createHyperlink, logShortcutAction);
      }
      return;
    }

    return next();
  },
  normalizeNode: (node, editor, next) => {
    if (isHyperlink(node.type) && node.getInlines().size > 0) {
      return () => {
        node
          .getInlines()
          .forEach(inlineNode => editor.unwrapInlineByKey(inlineNode.key, node.type));
      };
    }
    next();
  }
});

function isHyperlink(type) {
  return [HYPERLINK, ENTRY_HYPERLINK, ASSET_HYPERLINK].includes(type);
}
