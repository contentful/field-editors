import React, { useState } from 'react';

import { css } from 'emotion';
import { EditorToolbar, EditorToolbarDivider } from '@contentful/forma-36-react-components';
import { ToolbarHrButton } from '../plugins/Hr';
import { ToolbarHeadingButton } from '../plugins/Heading';
import { ToolbarQuoteButton } from '../plugins/Quote';
import { ToolbarListButton } from '../plugins/List';
import { ToolbarBoldButton } from '../plugins/Bold';
import { ToolbarCodeButton } from '../plugins/Code';
import { ToolbarItalicButton } from '../plugins/Italic';
import { ToolbarUnderlineButton } from '../plugins/Underline';
import { ToolbarHyperlinkButton } from '../plugins/Hyperlink';
import { ToolbarTableButton } from '../plugins/Table';
import { EmbeddedEntityDropdownButton } from '../plugins/EmbeddedEntity';
import { ToolbarIcon as EmbeddedEntityBlockToolbarIcon } from '../plugins/EmbeddedEntityBlock';
import { SPEditor, useStoreEditor } from '@udecode/slate-plugins-core';
import { BLOCKS } from '@contentful/rich-text-types';
import { isNodeTypeSelected } from '../helpers/editor';
import { ToolbarEmbeddedEntityInlineButton } from '../plugins/EmbeddedEntityInline';

type ToolbarProps = {
  isDisabled?: boolean;
};

const styles = {
  embedActionsWrapper: css({
    display: ['-webkit-box', '-ms-flexbox', 'flex'],
    webkitAlignSelf: 'flex-start',
    alignSelf: 'flex-start',
    msFlexItemAlign: 'start',
    marginLeft: 'auto',
  }),
  formattingOptionsWrapper: css({
    display: ['-webkit-box', '-ms-flexbox', 'flex'],
    msFlexAlign: 'center',
    webkitBoxAlign: 'center',
    alignItems: 'center',
    msFlexWrap: 'wrap',
    flexWrap: 'wrap',
    marginRight: '20px',
  }),
};

const Toolbar = ({ isDisabled }: ToolbarProps) => {
  const editor = useStoreEditor() as SPEditor;
  const canInsertBlocks = !isNodeTypeSelected(editor, BLOCKS.TABLE);
  const [isEmbedDropdownOpen, setEmbedDropdownOpen] = useState(false);
  const onCloseEntityDropdown = () => setEmbedDropdownOpen(false);
  const onToggleEntityDropdown = () => setEmbedDropdownOpen(!isEmbedDropdownOpen);

  return (
    <EditorToolbar testId="toolbar">
      <div className={styles.formattingOptionsWrapper}>
        <ToolbarHeadingButton isDisabled={isDisabled || !canInsertBlocks} />

        <EditorToolbarDivider />

        <ToolbarBoldButton isDisabled={isDisabled} />
        <ToolbarItalicButton isDisabled={isDisabled} />
        <ToolbarUnderlineButton isDisabled={isDisabled} />
        <ToolbarCodeButton isDisabled={isDisabled} />

        <EditorToolbarDivider />

        <ToolbarHyperlinkButton isDisabled={isDisabled} />

        <EditorToolbarDivider />

        <ToolbarQuoteButton isDisabled={isDisabled || !canInsertBlocks} />
        <ToolbarListButton isDisabled={isDisabled || !canInsertBlocks} />
        <ToolbarHrButton isDisabled={isDisabled || !canInsertBlocks} />

        <ToolbarTableButton isDisabled={isDisabled || !canInsertBlocks} />
      </div>
      <div className={styles.embedActionsWrapper}>
        <EmbeddedEntityDropdownButton
          isDisabled={isDisabled}
          onClose={onCloseEntityDropdown}
          onToggle={onToggleEntityDropdown}
          isOpen={isEmbedDropdownOpen}>
          <EmbeddedEntityBlockToolbarIcon
            isDisabled={!!isDisabled}
            nodeType={BLOCKS.EMBEDDED_ENTRY}
            onClose={onCloseEntityDropdown}
          />
          <ToolbarEmbeddedEntityInlineButton
            isDisabled={!!isDisabled}
            onClose={onCloseEntityDropdown}
          />
          <EmbeddedEntityBlockToolbarIcon
            isDisabled={!!isDisabled}
            nodeType={BLOCKS.EMBEDDED_ASSET}
            onClose={onCloseEntityDropdown}
          />
        </EmbeddedEntityDropdownButton>
      </div>
    </EditorToolbar>
  );
};

export default Toolbar;
