import * as React from 'react';

import { QuoteIcon } from '@contentful/f36-icons';
import { BLOCKS } from '@contentful/rich-text-types';
import * as Slate from 'slate-react';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { isBlockSelected } from '../../../helpers/editor';
import { ToolbarButton } from '../../shared/ToolbarButton';
import { toggleQuote } from '../toggleQuote';

export interface ToolbarQuoteButtonProps {
  isDisabled?: boolean;
}

export function ToolbarQuoteButton(props: ToolbarQuoteButtonProps) {
  const editor = useContentfulEditor();

  function handleOnClick() {
    if (!editor) return;

    toggleQuote(editor);
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
