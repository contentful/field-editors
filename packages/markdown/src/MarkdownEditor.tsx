import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { FieldConnector } from '@contentful/field-editor-shared';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import { MarkdownTabs } from './components/MarkdownTabs';
import { MarkdownToolbar } from './components/MarkdownToolbar';
import { MarkdownTextarea } from './components/MarkdownTextarea/MarkdownTextarea';
import { InitializedEditorType } from './components/MarkdownTextarea/MarkdownTextarea';
import { MarkdownBottomBar, MarkdownHelp, MarkdownCounter } from './components/MarkdownBottomBar';
import { MarkdownTab } from './types';
import { openCheatsheetModal } from './dialogs/CheatsheetModalDialog';
import { openInsertLinkDialog } from './dialogs/InsertLinkModalDialog';
import { openInsertSpecialCharacter } from './dialogs/SpecialCharacterModalDialog';
import { MarkdownPreview } from './components/MarkdownPreview/MarkdownPreview';
import { openInsertTableDialog } from './dialogs/InsertTableModalDialog';
import { openEmbedExternalContentDialog } from './dialogs/EmdebExternalContentDialog';
import * as LinkOrganizer from './utils/linkOrganizer';

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
  sdk: FieldExtensionSDK;
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
    <FieldConnector<string> field={props.sdk.field} isInitiallyDisabled={props.isInitiallyDisabled}>
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
                  },
                  code: () => {
                    editor?.actions.code();
                  },
                  hr: () => {
                    editor?.actions.hr();
                  },
                  indent: () => {
                    editor?.actions.indent();
                  },
                  dedent: () => {
                    editor?.actions.dedent();
                  }
                },
                history: {
                  undo: () => {
                    editor?.actions.undo();
                  },
                  redo: () => {
                    editor?.actions.redo();
                  }
                },
                insertLink: async () => {
                  if (!editor) {
                    return;
                  }
                  editor.usePrimarySelection();
                  const selectedText = editor.getSelectedText();
                  const result = await openInsertLinkDialog(props.sdk.dialogs, { selectedText });
                  if (result) {
                    editor.actions.link(result.url, selectedText || result.text, result.title);
                  }
                },
                insertSpecialCharacter: async () => {
                  if (!editor) {
                    return;
                  }
                  const result = await openInsertSpecialCharacter(props.sdk.dialogs);
                  if (result) {
                    editor.insert(result);
                  }
                },
                insertTable: async () => {
                  if (!editor) {
                    return;
                  }
                  const result = await openInsertTableDialog(props.sdk.dialogs);
                  if (result) {
                    editor.actions.table(result);
                  }
                },
                organizeLinks: () => {
                  if (!editor) {
                    return;
                  }
                  let text = editor.getContent();
                  if (!text) {
                    return;
                  }
                  text = LinkOrganizer.convertInlineToRef(text);
                  text = LinkOrganizer.rewriteRefs(text);
                  editor.setContent(text);
                  props.sdk.notifier.success(
                    'All your links are now references at the bottom of your document.'
                  );
                },
                embedExternalContent: async () => {
                  if (!editor) {
                    return;
                  }
                  const result = await openEmbedExternalContentDialog(props.sdk.dialogs);
                  if (result) {
                    editor.insert(result);
                  }
                },
                addNewMedia: async () => {
                  if (!editor) {
                    return;
                  }

                  await props.sdk.navigator.openNewAsset({
                    slideIn: { waitForClose: true }
                  });
                },
                linkExistingMedia: async () => {
                  if (!editor) {
                    return;
                  }
                  try {
                    const assets = await props.sdk.dialogs.selectMultipleAssets({
                      locale: props.sdk.field.locale
                    });
                  } finally {
                    editor.focus();
                  }

                  console.log(assets);
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
                  openCheatsheetModal(props.sdk.dialogs);
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
