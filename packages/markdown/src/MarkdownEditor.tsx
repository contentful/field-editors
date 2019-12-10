import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';
import { DialogsAPI } from 'contentful-ui-extensions-sdk';
import { MarkdownTabs } from './components/MarkdownTabs';
import { MarkdownToolbar } from './components/MarkdownToolbar';
import { MarkdownTextarea } from './components/MarkdownTextarea/MarkdownTextarea';
import { InitializedEditorType } from './components/MarkdownTextarea/MarkdownTextarea';
import { MarkdownBottomBar, MarkdownHelp, MarkdownCounter } from './components/MarkdownBottomBar';
import { MarkdownTab } from './types';
import { openCheatsheetModal } from './CheatsheetModalContent';
import { MarkdownPreview } from './components/MarkdownPreview/MarkdownPreview';

const styles = {
  container: css({
    display: 'flex',
    flexDirection: 'column',
    fontFamily: tokens.fontStackPrimary
  })
};

export interface MarkdownEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;
  field: FieldAPI;
  dialogs: DialogsAPI;
  onReady?: Function;
}

export function MarkdownEditor(props: MarkdownEditorProps) {
  const [selectedTab, setSelectedTab] = React.useState<MarkdownTab>('editor');
  const [editor, setEditor] = React.useState<InitializedEditorType | null>(null);

  React.useEffect(() => {
    if (editor && props.onReady) {
      props.onReady(editor);
    }
  }, [editor]);

  return (
    <FieldConnector<string> field={props.field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ value, disabled }) => {
        const isActionDisabled = editor === null || disabled || selectedTab !== 'editor';

        return (
          <div className={styles.container} data-test-id="markdown-editor">
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
                simple: {
                  italic: () => {
                    editor?.actions.italic();
                  },
                  bold: () => {
                    editor?.actions.bold();
                  },
                  quote: () => {
                    editor?.actions.quote();
                  },
                  ol: () => {
                    editor?.actions.ol();
                  },
                  ul: () => {
                    editor?.actions.ul();
                  },
                  strike: () => {
                    editor?.actions.strike();
                  }
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
