import { FieldExtensionSDK } from '@contentful/app-sdk';

import { TrackingProvider } from '../TrackingProvider';
import { RichTextPlugin } from '../types';
import { createSoftBreakPlugin, createExitBreakPlugin } from './Break';
import { createDragAndDropPlugin } from './DragAndDrop';
import {
  createEmbeddedAssetBlockPlugin,
  createEmbeddedEntryBlockPlugin,
} from './EmbeddedEntityBlock';
import { createEmbeddedEntityInlinePlugin } from './EmbeddedEntityInline';
import { createHeadingPlugin } from './Heading';
import { createHrPlugin } from './Hr';
import { createHyperlinkPlugin } from './Hyperlink';
import { createListPlugin } from './List';
import { createMarksPlugin } from './Marks';
import { createNormalizerPlugin } from './Normalizer';
import { createParagraphPlugin } from './Paragraph';
import { createPastePlugin } from './Paste';
import { createQuotePlugin } from './Quote';
import { createTablePlugin } from './Table';
import { createTextPlugin } from './Text';
import { createTrailingParagraphPlugin } from './TrailingParagraph';
import { createVoidsPlugin } from './Voids';

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
  createVoidsPlugin(),

  // These plugins drive their configurations from the list of plugins
  // above. They MUST come last.
  createSoftBreakPlugin(),
  createExitBreakPlugin(),
  createNormalizerPlugin(),
];
