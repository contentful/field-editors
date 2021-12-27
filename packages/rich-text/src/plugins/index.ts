import { FieldExtensionSDK } from '@contentful/app-sdk';

import { createPastePlugin } from './Paste';
import { createListPlugin } from './List';

import { createHrPlugin } from './Hr';
import { createHeadingPlugin } from './Heading';
import { createMarksPlugin } from './Marks';
import { createParagraphPlugin } from './Paragraph';
import { createQuotePlugin } from './Quote';
import { createSoftBreakPlugin, createExitBreakPlugin } from './Break';
import { createTablePlugin } from './Table';
import { createHyperlinkPlugin } from './Hyperlink';
import {
  createEmbeddedAssetBlockPlugin,
  createEmbeddedEntryBlockPlugin,
} from './EmbeddedEntityBlock';
import { createEmbeddedEntityInlinePlugin } from './EmbeddedEntityInline';
import { TrackingProvider } from '../TrackingProvider';
import { createTrailingParagraphPlugin } from './TrailingParagraph';
import { createDragAndDropPlugin } from './DragAndDrop';
import { createTextPlugin } from './Text';
import { RichTextPlugin } from './types';

export const getPlugins = (
  sdk: FieldExtensionSDK,
  tracking: TrackingProvider
): RichTextPlugin[] => [
  // Behavior
  createPastePlugin(),

  // Global shortcuts
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
  createMarksPlugin(),

  // Other
  createTrailingParagraphPlugin(),
  createTextPlugin(),

  // These plugins drive their configurations from the list of plugins
  // above. They MUST come last.
  createSoftBreakPlugin(),
  createExitBreakPlugin(),
];
