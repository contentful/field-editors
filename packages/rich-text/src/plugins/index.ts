import { FieldExtensionSDK } from '@contentful/app-sdk';

import { createPastePlugin } from './Paste';
import { createListPlugin, withListOptions } from './List';
import { createHistoryPlugin, createReactPlugin } from '@udecode/plate-core';
import { createDeserializeHTMLPlugin } from '@udecode/plate-html-serializer';
import { createDeserializeAstPlugin } from '@udecode/plate-ast-serializer';
import { createHrPlugin, withHrOptions } from './Hr';
import { withHeadingOptions, createHeadingPlugin } from './Heading';
import { createBoldPlugin, withBoldOptions } from './Bold';
import { withCodeOptions, createCodePlugin } from './Code';
import { withItalicOptions, createItalicPlugin } from './Italic';
import { createUnderlinePlugin, withUnderlineOptions } from './Underline';
import { createParagraphPlugin, withParagraphOptions } from './Paragraph';
import { createQuotePlugin, withQuoteOptions } from './Quote';
import { createNewLinePlugin } from './NewLine';
import { createInsertBeforeFirstVoidBlockPlugin } from './InsertBeforeFirstVoidBlock';
import { createTablePlugin, withTableOptions } from './Table';
import { createHyperlinkPlugin, withHyperlinkOptions } from './Hyperlink';
import {
  createEmbeddedAssetBlockPlugin,
  createEmbeddedEntryBlockPlugin,
  withEmbeddedAssetBlockOptions,
  withEmbeddedEntryBlockOptions,
} from './EmbeddedEntityBlock';
import {
  createEmbeddedEntityInlinePlugin,
  withEmbeddedEntityInlineOptions,
} from './EmbeddedEntityInline';
import { TrackingProvider } from '../TrackingProvider';
import { createTrailingParagraphPlugin } from './TrailingParagraph';
import { createDragAndDropPlugin } from './DragAndDrop';
import { createTextPlugin } from './Text';

export const getPlugins = (sdk: FieldExtensionSDK, tracking: TrackingProvider) => {
  const plugins = [
    // Core
    createReactPlugin(),
    createHistoryPlugin(),

    // Behavior
    createPastePlugin(),

    // Global shortcuts
    createNewLinePlugin(),
    createInsertBeforeFirstVoidBlockPlugin(),
    createDragAndDropPlugin(),

    // Block Elements
    createParagraphPlugin(),
    createListPlugin(),
    createHrPlugin(),
    createHeadingPlugin(),
    createQuotePlugin(),
    createTablePlugin(tracking),
    createEmbeddedEntryBlockPlugin(sdk),
    createEmbeddedAssetBlockPlugin(sdk),

    // Inline elements
    createHyperlinkPlugin(sdk),
    createEmbeddedEntityInlinePlugin(sdk),

    // Marks
    createBoldPlugin(),
    createCodePlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),

    // Other
    createTrailingParagraphPlugin(),
    createTextPlugin(),
  ];

  return plugins.concat([
    createDeserializeHTMLPlugin({ plugins }),
    createDeserializeAstPlugin({ plugins }),
  ] as any);
};

export const pluginOptions = {
  // Block elements
  ...withParagraphOptions,
  ...withListOptions,
  ...withHrOptions,
  ...withHeadingOptions,
  ...withQuoteOptions,
  ...withTableOptions,
  ...withEmbeddedEntryBlockOptions,
  ...withEmbeddedAssetBlockOptions,

  // Inline elements
  ...withHyperlinkOptions,
  ...withEmbeddedEntityInlineOptions,

  // Marks
  ...withBoldOptions,
  ...withCodeOptions,
  ...withItalicOptions,
  ...withUnderlineOptions,
};
