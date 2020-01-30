import React from 'react';

import { getDecorationOrDefault, hasCommandPaletteMarkType } from './Util';
import CommandPalette from './CommandPalette';
import CommandMark from './CommandMark';

export const CommandPalettePlugin = ({ richTextAPI }) => ({
  decorateNode: (_node, editor, next) => {
    const others = next();

    const decoration = getDecorationOrDefault(editor);

    if (decoration) {
      return [...others, decoration];
    }

    return [...others];
  },
  renderMark: (props, editor, next) => {
    if (hasCommandPaletteMarkType(props.mark.type)) {
      return (
        <CommandMark attributes={props.attributes} editor={editor}>
          {props.children}
        </CommandMark>
      );
    }
    return next();
  },
  renderEditor: (_props, editor, next) => {
    const children = next();
    return (
      <React.Fragment>
        {children}
        <CommandPalette
          anchor={editor.state.commandMark}
          value={editor.value}
          editor={editor}
          richTextAPI={richTextAPI}
        />
      </React.Fragment>
    );
  }
});
