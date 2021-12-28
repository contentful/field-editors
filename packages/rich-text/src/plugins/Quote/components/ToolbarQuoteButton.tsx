import * as React from 'react';
import * as Slate from 'slate-react';
import { QuoteIcon } from '@contentful/f36-icons';
import { ToolbarButton } from '../../shared/ToolbarButton';
import { BLOCKS } from '@contentful/rich-text-types';
import { isBlockSelected } from '../../../helpers/editor';
import { useContentfulEditor } from '../../../ContentfulEditorProvider';

import { createBlockQuote } from '../utils';

export interface ToolbarQuoteButtonProps {
  isDisabled?: boolean;
}

export function ToolbarQuoteButton(props: ToolbarQuoteButtonProps) {
  const editor = useContentfulEditor();

  function handleOnClick() {
    if (!editor) return;

    createBlockQuote(editor);
    Slate.ReactEditor.focus(editor);
  }

  if (!editor) return null;

  return (
    <ToolbarButton
      title="Blockquote"
      onClick={handleOnClick}
      testId="quote-toolbar-button"
      isDisabled={props.isDisabled}
      isActive={isBlockSelected(editor, BLOCKS.QUOTE)}>
      <QuoteIcon />
    </ToolbarButton>
  );
}
