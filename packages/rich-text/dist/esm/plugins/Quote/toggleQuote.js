import { BLOCKS } from '@contentful/rich-text-types';
import isHotkey from 'is-hotkey';
import { isBlockSelected } from '../../helpers/editor';
import { withoutNormalizing, wrapNodes, unwrapNodes, isElement } from '../../internal';
export function toggleQuote(editor, logAction) {
    if (!editor.selection) return;
    const isActive = isBlockSelected(editor, BLOCKS.QUOTE);
    logAction?.(isActive ? 'remove' : 'insert', {
        nodeType: BLOCKS.QUOTE
    });
    withoutNormalizing(editor, ()=>{
        if (!editor.selection) return;
        unwrapNodes(editor, {
            match: (node)=>isElement(node) && node.type === BLOCKS.QUOTE,
            split: true
        });
        if (!isActive) {
            const quote = {
                type: BLOCKS.QUOTE,
                data: {},
                children: []
            };
            wrapNodes(editor, quote);
        }
    });
}
export const onKeyDownToggleQuote = (editor, plugin)=>(event)=>{
        const { hotkey } = plugin.options;
        if (hotkey && isHotkey(hotkey, event)) {
            event.preventDefault();
            toggleQuote(editor, editor.tracking.onShortcutAction);
        }
    };
