import React from 'react';
import { ToolbarIconCustom } from '../ToolbarIconCustom';
import { MdFormatAlignCenter, MdFormatAlignRight } from 'react-icons/md';

const onToggle = (editor, isActive, alignment) => {
  editor.value.blocks.forEach(block => {
    editor.setNodeByKey(block.key, {
      data: { ...block.data.toJSON(), textAlign: isActive ? null : alignment }
    });
  });
};

export const TextAlignCenter = ({ editor }) => {
  const isActive = editor.value.blocks.some(block => block.data.get('textAlign') === 'center');
  return (
    <ToolbarIconCustom
      isActive={isActive}
      disabled={false}
      onToggle={() => onToggle(editor, isActive, 'center')}
      icon={'Text'}
      title={'Text align center'}>
      <MdFormatAlignCenter />
    </ToolbarIconCustom>
  );
};

export const TextAlignRight = ({ editor }) => {
  const isActive = editor.value.blocks.some(block => block.data.get('textAlign') === 'right');
  return (
    <ToolbarIconCustom
      isActive={isActive}
      disabled={false}
      onToggle={() => onToggle(editor, isActive, 'right')}
      icon={'Text'}
      title={'Text align right'}>
      <MdFormatAlignRight />
    </ToolbarIconCustom>
  );
};
