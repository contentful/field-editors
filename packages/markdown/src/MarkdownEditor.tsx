import React from 'react';
import { css } from 'emotion';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';
import { DialogsAPI } from 'contentful-ui-extensions-sdk';
import { MarkdownTabs } from './components/MarkdownTabs';
import { MarkdownToolbar } from './components/MarkdownToolbar';
import { MarkdownTextarea } from './components/MarkdownTextarea/index';
import { InitializedEditorType } from './components/MarkdownTextarea/MarkdownTextarea';
import { MarkdownBottomBar, MarkdownHelp, MarkdownCounter } from './components/MarkdownBottomBar';
import { MarkdownTab } from './types';
import { openCheatsheetModal } from './CheatsheetModalContent';
import { MarkdownPreview } from './components/MarkdownPreview';

const styles = {
  container: css({
    display: 'flex',
    flexDirection: 'column'
  })
};

export interface MarkdownEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;
  field: FieldAPI;
  dialogs: DialogsAPI;
}

export function MarkdownEditor(props: MarkdownEditorProps) {
  const [selectedTab, setSelectedTab] = React.useState<MarkdownTab>('editor');
  const [editor, setEditor] = React.useState<InitializedEditorType | null>(null);

  return (
    <FieldConnector<string> field={props.field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ value, disabled }) => {
        const isActionDisabled = editor === null || disabled || selectedTab !== 'editor';

        return (
          <div className={styles.container}>
            <MarkdownTabs
              active={selectedTab}
              onSelect={tab => {
                setSelectedTab(tab);
              }}
            />
            <MarkdownToolbar
              disabled={isActionDisabled}
              actions={{
                headings: {
                  h1: () => {
                    editor?.actions.h1();
                  },
                  h2: () => {
                    editor?.actions.h2();
                  },
                  h3: () => {
                    editor?.actions.h3();
                  }
                },
                italic: () => {
                  editor?.actions.italic();
                },
                bold: () => {
                  editor?.actions.bold();
                },
                quote: () => {
                  editor?.actions.quote();
                },
                linkExistingMedia: () => {
                  props.dialogs.selectMultipleAssets();
                }
              }}
            />
            <MarkdownTextarea
              visible={selectedTab === 'editor'}
              disabled={isActionDisabled}
              direction="ltr"
              onReady={editor => {
                editor.setContent(value ?? '');
                editor.setReadOnly(false);
                setEditor(editor);
              }}
            />
            {selectedTab === 'preview' && <MarkdownPreview />}
            <MarkdownBottomBar>
              <MarkdownHelp
                onClick={() => {
                  openCheatsheetModal(props.dialogs);
                }}
              />
              <MarkdownCounter words={0} characters={0} />
            </MarkdownBottomBar>
          </div>
        );
      }}
    </FieldConnector>
  );
}
