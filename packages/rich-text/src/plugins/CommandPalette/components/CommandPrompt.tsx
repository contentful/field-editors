import * as React from 'react';

import { BLOCKS } from '@contentful/rich-text-types';
import { PlateRenderLeafProps } from '@udecode/plate-core';
import { RichTextEditor } from 'types';

import { isNodeTypeSelected } from '../../../helpers/editor';
import { trimLeadingSlash } from '../utils/trimLeadingSlash';
import { CommandList } from './CommandList';

export const CommandPrompt = (props: PlateRenderLeafProps) => {
  const query = trimLeadingSlash(props.text.text);
  const editor = props.editor as RichTextEditor;
  const canInsertBlocks = !isNodeTypeSelected(editor, BLOCKS.TABLE);

  return (
    <span {...props.attributes}>
      {props.children}
      {canInsertBlocks && <CommandList query={query} editor={editor} />}
    </span>
  );
};
