"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    disableCorePlugins: function() {
        return disableCorePlugins;
    },
    getPlugins: function() {
        return getPlugins;
    }
});
const _Alignment = require("./Alignment");
const _Break = require("./Break");
const _CharCounter = require("./CharCounter");
const _CommandPalette = require("./CommandPalette");
const _useCommands = require("./CommandPalette/useCommands");
const _DeserializeDocx = require("./DeserializeDocx");
const _DragAndDrop = require("./DragAndDrop");
const _EmbeddedEntityBlock = require("./EmbeddedEntityBlock");
const _EmbeddedEntityInline = require("./EmbeddedEntityInline");
const _EmbeddedResourceBlock = require("./EmbeddedResourceBlock");
const _EmbeddedResourceInline = require("./EmbeddedResourceInline");
const _Heading = require("./Heading");
const _Hr = require("./Hr");
const _Hyperlink = require("./Hyperlink");
const _List = require("./List");
const _Marks = require("./Marks");
const _Normalizer = require("./Normalizer");
const _Paragraph = require("./Paragraph");
const _PasteHTML = require("./PasteHTML");
const _Quote = require("./Quote");
const _SelectOnBackspace = require("./SelectOnBackspace");
const _Table = require("./Table");
const _Text = require("./Text");
const _Tracking = require("./Tracking");
const _TrailingParagraph = require("./TrailingParagraph");
const _Voids = require("./Voids");
const getPlugins = (sdk, onAction, restrictedMarks)=>[
        (0, _DeserializeDocx.createDeserializeDocxPlugin)(),
        (0, _Tracking.createTrackingPlugin)(onAction),
        (0, _DragAndDrop.createDragAndDropPlugin)(),
        ...Object.values((0, _useCommands.isCommandPromptPluginEnabled)(sdk)).some(Boolean) ? [
            (0, _CommandPalette.createCommandPalettePlugin)()
        ] : [],
        (0, _Paragraph.createParagraphPlugin)(),
        (0, _List.createListPlugin)(),
        (0, _Hr.createHrPlugin)(),
        (0, _Heading.createHeadingPlugin)(),
        (0, _Quote.createQuotePlugin)(),
        (0, _Table.createTablePlugin)(),
        (0, _EmbeddedEntityBlock.createEmbeddedEntryBlockPlugin)(sdk),
        (0, _EmbeddedEntityBlock.createEmbeddedAssetBlockPlugin)(sdk),
        (0, _EmbeddedResourceBlock.createEmbeddedResourceBlockPlugin)(sdk),
        (0, _Hyperlink.createHyperlinkPlugin)(sdk),
        (0, _EmbeddedEntityInline.createEmbeddedEntityInlinePlugin)(sdk),
        (0, _EmbeddedResourceInline.createEmbeddedResourceInlinePlugin)(sdk),
        (0, _Marks.createMarksPlugin)(),
        (0, _Alignment.createAlignmentPlugin)(),
        (0, _TrailingParagraph.createTrailingParagraphPlugin)(),
        (0, _Text.createTextPlugin)(restrictedMarks),
        (0, _Voids.createVoidsPlugin)(),
        (0, _SelectOnBackspace.createSelectOnBackspacePlugin)(),
        (0, _PasteHTML.createPasteHTMLPlugin)(),
        (0, _CharCounter.createCharCounterPlugin)(),
        (0, _Break.createSoftBreakPlugin)(),
        (0, _Break.createExitBreakPlugin)(),
        (0, _Break.createResetNodePlugin)(),
        (0, _Normalizer.createNormalizerPlugin)()
    ];
const disableCorePlugins = {
    eventEditor: true
};
