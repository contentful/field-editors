import React from 'react';

import type { Editor, Node } from '@tiptap/core';

type CustomNodeToolbarButtonsProps = {
  editor: Editor;
  customNodes: Node[];
};

export function CustomNodeToolbarButtons({ editor, customNodes }: CustomNodeToolbarButtonsProps) {
  return (
    <>
      {customNodes.map((node) => (
        <button
          key={node.name}
          onClick={() => {
            editor
              .chain()
              .focus()
              .insertContentAt(editor.view.state.selection, {
                type: node.name,
              })
              .run();
          }}
          className={editor.isActive(node.name) ? 'is-active' : ''}>
          add {node.name}
        </button>
      ))}
    </>
  );
}
