import { FieldExtensionSDK } from '@contentful/app-sdk';

import { createPastePlugin } from './Paste';
import { createListPlugin } from './List';
import { PlatePlugin } from '@udecode/plate-core';
import { createHrPlugin } from './Hr';
import { createHeadingPlugin } from './Heading';
import { createMarksPlugin } from './Marks';
import { createParagraphPlugin } from './Paragraph';
import { createQuotePlugin } from './Quote';
import { createBreakPlugin } from './Break';
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

export const getPlugins = (sdk: FieldExtensionSDK, tracking: TrackingProvider): PlatePlugin[] => [
  // Behavior
  createPastePlugin(),

  // Global shortcuts
  createBreakPlugin(),
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
];
