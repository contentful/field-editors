import React from 'react';
import { ToolbarIconCustom } from '../ToolbarIconCustom';
import { MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight } from 'react-icons/md';

const onToggle = (editor, isActive, alignment) => {
  editor.value.blocks.forEach(block => {
    editor.setNodeByKey(block.key, {
      data: { ...block.data.toJSON(), textAlign: isActive ? null : alignment }
    });
  });
};

// Text align left button.
export const TextAlignLeft = ({ editor }) => {
  const isActive = editor.value.blocks.some(block => block.data.get('textAlign') === 'left');
  return (
      <ToolbarIconCustom
          isActive={isActive}
          disabled={false}
          onToggle={() => onToggle(editor, isActive, 'left')}
          icon={'Text'}
          title={'Text align left'}>
        <MdFormatAlignLeft />
      </ToolbarIconCustom>
  );
};

// Text align center button.
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

// Text align right button.
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
