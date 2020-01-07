import { InitializedEditorType } from './components/MarkdownTextarea/MarkdownTextarea';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import { openInsertLinkDialog } from './dialogs/InsertLinkModalDialog';
import { openInsertSpecialCharacter } from './dialogs/SpecialCharacterModalDialog';
import { openInsertTableDialog } from './dialogs/InsertTableModalDialog';
import { openEmbedExternalContentDialog } from './dialogs/EmdebExternalContentDialog';
import { openConfirmInsertAsset } from './dialogs/ConfirmInsertAssetModalDialog';
import { insertAssetLinks } from './utils/insertAssetLinks';
import * as LinkOrganizer from './utils/linkOrganizer';

export function createMarkdownActions(
  sdk: FieldExtensionSDK,
  editor: InitializedEditorType | null
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const insertAssetsWithConfirmation = async (assets: Array<Object> | null) => {
    if (assets) {
      const { links, fallbacks } = await insertAssetLinks(assets, {
        localeCode: sdk.field.locale,
        defaultLocaleCode: sdk.locales.default,
        fallbackCode: sdk.locales.fallbacks[sdk.field.locale]
      });
      if (links && links.length > 0) {
        if (fallbacks) {
          const insertAnyway = await openConfirmInsertAsset(sdk.dialogs, {
            locale: sdk.field.locale,
            assets: fallbacks
          });
          if (!insertAnyway) {
            throw Error('User decided to not use fallbacks');
          }
        }
        return links.map(link => link.asMarkdown).join('\n\n');
      }
    }
    return '';
  };

  return {
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
      const result = await openInsertLinkDialog(sdk.dialogs, { selectedText });
      if (result) {
        editor.actions.link(result.url, selectedText || result.text, result.title);
      }
    },
    insertSpecialCharacter: async () => {
      if (!editor) {
        return;
      }
      const result = await openInsertSpecialCharacter(sdk.dialogs);
      if (result) {
        editor.insert(result);
      }
    },
    insertTable: async () => {
      if (!editor) {
        return;
      }
      const result = await openInsertTableDialog(sdk.dialogs);
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
      sdk.notifier.success('All your links are now references at the bottom of your document.');
    },
    embedExternalContent: async () => {
      if (!editor) {
        return;
      }
      const result = await openEmbedExternalContentDialog(sdk.dialogs);
      if (result) {
        editor.insert(result);
      }
    },
    addNewMedia: async () => {
      if (!editor) {
        return;
      }
      try {
        const { entity: asset } = (await sdk.navigator.openNewAsset({
          slideIn: { waitForClose: true }
        })) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        const markdownLinks = await insertAssetsWithConfirmation([asset]);
        editor.insert(markdownLinks);
      } finally {
        editor.focus();
      }
    },
    linkExistingMedia: async () => {
      if (!editor) {
        return;
      }
      try {
        const assets = await sdk.dialogs.selectMultipleAssets({
          locale: sdk.field.locale
        });
        const markdownLinks = await insertAssetsWithConfirmation(assets);
        editor.insert(markdownLinks);
      } finally {
        editor.focus();
      }
    }
  };
}
