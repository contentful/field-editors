import React from 'react';
import ToolbarIcon from '../../shared/ToolbarIcon';

const onToggle = (editor, isActive) => {
  editor.value.blocks.forEach(block => {
    editor.setNodeByKey(block.key, {
      data: { ...block.data.toJSON(), smallText: !isActive }
    });
  });
};

export const SmallText = ({ editor }) => {
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
