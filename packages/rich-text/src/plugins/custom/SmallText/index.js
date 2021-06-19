import React from 'react';
import ToolbarIcon from '../../shared/ToolbarIcon';

// When the small text button is pressed in the editor, if any of the selected
// text blocks have active small text then set smallText to false for all blocks.
// Otherwise set to true for all blocks.
const onToggle = (editor, isActive) => {
  editor.value.blocks.forEach(block => {
    editor.setNodeByKey(block.key, {
      data: { ...block.data.toJSON(), smallText: !isActive }
    });
  });
};

// Small text toolbar button.
export const SmallText = ({ editor }) => {
  // Is active if any of the selected blocks have the smallText data attribute.
  const isActive = editor.value.blocks.some(block => block.data.get('smallText'));
  return (
    <ToolbarIcon
      isActive={isActive}
      disabled={false}
      onToggle={() => onToggle(editor, isActive)}
      icon={'Text'}
      title={'Small text'}
    />
  );
};
