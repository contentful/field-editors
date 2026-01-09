import { exitCode, chainCommands } from 'prosemirror-commands';
import type { NodeSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';

import { Node } from '../core';

export class LineBreak extends Node {
  name = 'line_break';

  schema: NodeSpec = {
    inline: true,
    group: 'inline',
    selectable: false,
    linebreakReplacement: true,
    parseDOM: [{ tag: 'br' }],
    toDOM: () => ['br'],
    leafText: () => '\n',
  };

  insertBreak: Command = ({ tr, schema }, dispatch) => {
    dispatch?.(
      tr
        .replaceSelectionWith(
          this.type({
            schema,
          }).create(),
        )
        .scrollIntoView(),
    );
    return true;
  };

  shortcuts: Record<string, Command> = {
    'Shift-Enter': chainCommands(exitCode, this.insertBreak),
  };
}
