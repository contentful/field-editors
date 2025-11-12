import * as React from 'react';
import { TextUnderlineIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { createUnderlinePlugin as createDefaultUnderlinePlugin } from '@udecode/plate-basic-marks';
import { someHtmlElement } from '../../internal/queries';
import { createMarkToolbarButton } from './components/MarkToolbarButton';
import { buildMarkEventHandler } from './helpers';
export const ToolbarUnderlineButton = createMarkToolbarButton({
    title: 'Underline',
    mark: MARKS.UNDERLINE,
    icon: /*#__PURE__*/ React.createElement(TextUnderlineIcon, null)
});
export function Underline(props) {
    return /*#__PURE__*/ React.createElement("u", props.attributes, props.children);
}
export const createUnderlinePlugin = ()=>createDefaultUnderlinePlugin({
        type: MARKS.UNDERLINE,
        component: Underline,
        options: {
            hotkey: [
                'mod+u'
            ]
        },
        handlers: {
            onKeyDown: buildMarkEventHandler(MARKS.UNDERLINE)
        },
        deserializeHtml: {
            rules: [
                {
                    validNodeName: [
                        'U'
                    ]
                },
                {
                    validStyle: {
                        textDecoration: [
                            'underline'
                        ]
                    }
                }
            ],
            query: (el)=>{
                return !someHtmlElement(el, (node)=>node.style.textDecoration === 'none');
            }
        }
    });
