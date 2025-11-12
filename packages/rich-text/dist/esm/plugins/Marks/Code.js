import * as React from 'react';
import { CodeSimpleIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { createCodePlugin as createDefaultCodePlugin } from '@udecode/plate-basic-marks';
import { css } from 'emotion';
import { createMarkToolbarButton } from './components/MarkToolbarButton';
import { buildMarkEventHandler } from './helpers';
export const ToolbarCodeButton = createMarkToolbarButton({
    title: 'Code',
    mark: MARKS.CODE,
    icon: /*#__PURE__*/ React.createElement(CodeSimpleIcon, null)
});
export const ToolbarDropdownCodeButton = createMarkToolbarButton({
    title: 'Code',
    mark: MARKS.CODE
});
const styles = {
    code: css({
        fontFamily: 'monospace',
        fontSize: '.9em'
    })
};
export function Code(props) {
    return /*#__PURE__*/ React.createElement("code", {
        ...props.attributes,
        className: styles.code
    }, props.children);
}
export const createCodePlugin = ()=>createDefaultCodePlugin({
        type: MARKS.CODE,
        component: Code,
        options: {
            hotkey: [
                'mod+/',
                'mod+shift+7'
            ]
        },
        handlers: {
            onKeyDown: buildMarkEventHandler(MARKS.CODE)
        },
        deserializeHtml: {
            rules: [
                {
                    validNodeName: [
                        'CODE',
                        'PRE'
                    ]
                },
                {
                    validStyle: {
                        fontFamily: [
                            'Consolas',
                            'monospace'
                        ]
                    }
                }
            ]
        }
    });
