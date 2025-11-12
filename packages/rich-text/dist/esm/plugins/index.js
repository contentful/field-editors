import { createAlignmentPlugin } from './Alignment';
import { createSoftBreakPlugin, createExitBreakPlugin, createResetNodePlugin } from './Break';
import { createCharCounterPlugin } from './CharCounter';
import { createCommandPalettePlugin } from './CommandPalette';
import { isCommandPromptPluginEnabled } from './CommandPalette/useCommands';
import { createDeserializeDocxPlugin } from './DeserializeDocx';
import { createDragAndDropPlugin } from './DragAndDrop';
import { createEmbeddedAssetBlockPlugin, createEmbeddedEntryBlockPlugin } from './EmbeddedEntityBlock';
import { createEmbeddedEntityInlinePlugin } from './EmbeddedEntityInline';
import { createEmbeddedResourceBlockPlugin } from './EmbeddedResourceBlock';
import { createEmbeddedResourceInlinePlugin } from './EmbeddedResourceInline';
import { createHeadingPlugin } from './Heading';
import { createHrPlugin } from './Hr';
import { createHyperlinkPlugin } from './Hyperlink';
import { createListPlugin } from './List';
import { createMarksPlugin } from './Marks';
import { createNormalizerPlugin } from './Normalizer';
import { createParagraphPlugin } from './Paragraph';
import { createPasteHTMLPlugin } from './PasteHTML';
import { createQuotePlugin } from './Quote';
import { createSelectOnBackspacePlugin } from './SelectOnBackspace';
import { createTablePlugin } from './Table';
import { createTextPlugin } from './Text';
import { createTrackingPlugin } from './Tracking';
import { createTrailingParagraphPlugin } from './TrailingParagraph';
import { createVoidsPlugin } from './Voids';
export const getPlugins = (sdk, onAction, restrictedMarks)=>[
        createDeserializeDocxPlugin(),
        createTrackingPlugin(onAction),
        createDragAndDropPlugin(),
        ...Object.values(isCommandPromptPluginEnabled(sdk)).some(Boolean) ? [
            createCommandPalettePlugin()
        ] : [],
        createParagraphPlugin(),
        createListPlugin(),
        createHrPlugin(),
        createHeadingPlugin(),
        createQuotePlugin(),
        createTablePlugin(),
        createEmbeddedEntryBlockPlugin(sdk),
        createEmbeddedAssetBlockPlugin(sdk),
        createEmbeddedResourceBlockPlugin(sdk),
        createHyperlinkPlugin(sdk),
        createEmbeddedEntityInlinePlugin(sdk),
        createEmbeddedResourceInlinePlugin(sdk),
        createMarksPlugin(),
        createAlignmentPlugin(),
        createTrailingParagraphPlugin(),
        createTextPlugin(restrictedMarks),
        createVoidsPlugin(),
        createSelectOnBackspacePlugin(),
        createPasteHTMLPlugin(),
        createCharCounterPlugin(),
        createSoftBreakPlugin(),
        createExitBreakPlugin(),
        createResetNodePlugin(),
        createNormalizerPlugin()
    ];
export const disableCorePlugins = {
    eventEditor: true
};
