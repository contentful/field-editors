import { BLOCKS } from '@contentful/rich-text-types';
import { BoldPlugin } from './Bold';
import { ItalicPlugin } from './Italic';
import { UnderlinedPlugin } from './Underlined';
import { CodePlugin } from './Code';
import { QuotePlugin } from './Quote';
import { HyperlinkPlugin } from './Hyperlink';
import {
  Heading1Plugin,
  Heading2Plugin,
  Heading3Plugin,
  Heading4Plugin,
  Heading5Plugin,
  Heading6Plugin
} from './Heading';

import NewLinePlugin from './NewLinePlugin';
import { ParagraphPlugin } from './Paragraph';

import { EmbeddedAssetBlockPlugin, EmbeddedEntryBlockPlugin } from './EmbeddedEntityBlock';
import { EmbeddedEntryInlinePlugin } from './EmbeddedEntryInline';

import { ListPlugin } from './List';
import { HrPlugin } from './Hr';

import TrailingBlock from '@wikifactory/slate-trailing-block';
import { PastePlugin } from './Paste';
import { PasteHtmlPlugin } from './PasteHtml';
import { PasteTextPlugin } from './PasteText';

import { CommandPalettePlugin } from './CommandPalette';
import { InsertBeforeFirstVoidBlockPlugin } from './InsertBeforeFirstVoidBlock';

import schema from '../constants/Schema';

export function buildPlugins(richTextAPI, customPlugins = []) {
  return [
    { schema },
    ...customPlugins.map(plugin => plugin({ richTextAPI })),
    InsertBeforeFirstVoidBlockPlugin({ richTextAPI }),
    BoldPlugin({ richTextAPI }),
    ItalicPlugin({ richTextAPI }),
    UnderlinedPlugin({ richTextAPI }),
    CodePlugin({ richTextAPI }),
    QuotePlugin({ richTextAPI }),
    HyperlinkPlugin({ richTextAPI }),
    Heading1Plugin({ richTextAPI }),
    Heading2Plugin({ richTextAPI }),
    Heading3Plugin({ richTextAPI }),
    Heading4Plugin({ richTextAPI }),
    Heading5Plugin({ richTextAPI }),
    Heading6Plugin({ richTextAPI }),
    ParagraphPlugin(),
    HrPlugin({ richTextAPI }),
    EmbeddedEntryInlinePlugin({ richTextAPI }),
    EmbeddedEntryBlockPlugin({ richTextAPI }),
    EmbeddedAssetBlockPlugin({ richTextAPI }),
    ListPlugin({ richTextAPI }),
    PastePlugin({ richTextAPI }),
    PasteHtmlPlugin(),
    PasteTextPlugin(),
    CommandPalettePlugin({ richTextAPI }),
    TrailingBlock({ type: BLOCKS.PARAGRAPH }),
    NewLinePlugin()
  ];
}
