import { BLOCKS } from '@contentful/rich-text-types';
import { createParagraphPlugin as createDefaultParagraphPlugin } from '@udecode/plate-paragraph';
import isHotkey from 'is-hotkey';
import { isInlineOrText, toggleElement } from '../../helpers/editor';
import { transformUnwrap, transformLift } from '../../helpers/transformers';
import { Paragraph } from './Paragraph';
import { isEmbedElement, isEmptyElement } from './utils';
const buildParagraphKeyDownHandler = (editor, { options: { hotkey } })=>(event)=>{
        if (editor.selection && hotkey && isHotkey(hotkey, event)) {
            toggleElement(editor, {
                activeType: BLOCKS.PARAGRAPH,
                inactiveType: BLOCKS.PARAGRAPH
            });
        }
    };
export const createParagraphPlugin = ()=>{
    const config = {
        type: BLOCKS.PARAGRAPH,
        component: Paragraph,
        options: {
            hotkey: [
                'mod+opt+0'
            ]
        },
        handlers: {
            onKeyDown: buildParagraphKeyDownHandler
        },
        softBreak: [
            {
                hotkey: 'shift+enter',
                query: {
                    allow: BLOCKS.PARAGRAPH
                }
            }
        ],
        deserializeHtml: {
            rules: [
                {
                    validNodeName: [
                        'P',
                        'DIV'
                    ]
                }
            ],
            query: (el)=>!isEmptyElement(el) && !isEmbedElement(el)
        },
        normalizer: [
            {
                validChildren: (_, [node])=>isInlineOrText(node),
                transform: {
                    [BLOCKS.PARAGRAPH]: transformUnwrap,
                    default: transformLift
                }
            }
        ]
    };
    return createDefaultParagraphPlugin(config);
};
