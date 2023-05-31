import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';

import { focus, insertEmptyParagraph, moveToTheNextChar } from '../../helpers/editor';
import newResourceEntitySelectorConfigFromRichTextField from '../../helpers/newResourceEntitySelectorConfigFromRichTextField';
import { watchCurrentSlide } from '../../helpers/sdkNavigatorSlideIn';
import { getText, getAboveNode, getLastNodeByLevel } from '../../internal/queries';
import { insertNodes, select, setNodes } from '../../internal/transforms';
import { PlateEditor } from '../../internal/types';
import { TrackingPluginActions } from '../../plugins/Tracking';

export async function selectEntityAndInsert(
  sdk,
  editor,
  logAction: TrackingPluginActions['onToolbarAction'] | TrackingPluginActions['onShortcutAction']
) {
  logAction('openCreateEmbedDialog', { nodeType: BLOCKS.EMBEDDED_RESOURCE });

  const { field, dialogs } = sdk;
  const config = newResourceEntitySelectorConfigFromRichTextField(field, BLOCKS.EMBEDDED_RESOURCE);

  const { selection } = editor;
  const rteSlide = watchCurrentSlide(sdk.navigator);
  const entity = await dialogs.selectSingleResourceEntry(config);

  if (!entity) {
    logAction('cancelCreateEmbedDialog', { nodeType: BLOCKS.EMBEDDED_RESOURCE });
  } else {
    // Selection prevents incorrect position of inserted ref when RTE doesn't have focus
    // (i.e. when using hotkeys and slide-in)
    select(editor, selection);
    insertBlock(editor, entity);
    ensureFollowingParagraph(editor);
    logAction('insert', { nodeType: BLOCKS.EMBEDDED_RESOURCE });
  }
  // If user chose to create a new entity, this might open slide-in to edit the
  // entity. In this case, no point in focusing RTE which is now in the slide below.
  rteSlide.onActive(() => {
    rteSlide.unwatch();
    focus(editor);
  });
}

// TODO: incorporate this logic inside the trailingParagraph plugin instead
function ensureFollowingParagraph(editor: PlateEditor) {
  const resourceBlock = getAboveNode(editor, {
    match: {
      type: [BLOCKS.EMBEDDED_RESOURCE],
    },
  });

  if (!resourceBlock) {
    return;
  }

  const level = resourceBlock[1].length - 1;
  const lastNode = getLastNodeByLevel(editor, level);

  const isTextContainer = (TEXT_CONTAINERS as string[]).includes(
    (lastNode?.[0].type ?? '') as string
  );

  // If the new block isn't followed by a sibling text container (e.g. paragraph)
  // we insert a new empty one. Level 0 is handled by the trailingParagraph plugin
  if (level !== 0 && !isTextContainer) {
    insertEmptyParagraph(editor);
  }

  moveToTheNextChar(editor);
}

const createNode = (entity) => ({
  type: BLOCKS.EMBEDDED_RESOURCE,
  data: {
    target: {
      sys: {
        urn: entity.sys.urn,
        type: 'ResourceLink',
        linkType: 'Contentful:Entry',
      },
    },
  },
  children: [{ text: '' }],
  isVoid: true,
});

// TODO: DRY up copied code from HR
export function insertBlock(editor: PlateEditor, entity) {
  if (!editor?.selection) return;

  const linkedResourceBlock = createNode(entity);

  const hasText = editor.selection && !!getText(editor, editor.selection.focus.path);

  if (hasText) {
    insertNodes(editor, linkedResourceBlock);
  } else {
    setNodes(editor, linkedResourceBlock);
  }
}
