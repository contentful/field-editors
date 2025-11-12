import * as React from 'react';
import { TextStrikethroughIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { createStrikethroughPlugin as createDefaultStrikethroughPlugin } from '@udecode/plate-basic-marks';
import { css } from 'emotion';
import { createMarkToolbarButton } from './components/MarkToolbarButton';
import { buildMarkEventHandler } from './helpers';
const styles = {
    strikethrough: css({
        textDecoration: 'line-through'
    })
};
export const ToolbarDropdownStrikethroughButton = createMarkToolbarButton({
    title: 'Strikethrough',
    mark: MARKS.STRIKETHROUGH
});
export const ToolbarStrikethroughButton = createMarkToolbarButton({
    title: 'Strikethrough',
    mark: MARKS.STRIKETHROUGH,
    icon: /*#__PURE__*/ React.createElement(TextStrikethroughIcon, null)
});
export function Strikethrough(props) {
    return /*#__PURE__*/ React.createElement("s", {
        ...props.attributes,
        className: styles.strikethrough
    }, props.children);
}
export const createStrikethroughPlugin = ()=>createDefaultStrikethroughPlugin({
        type: MARKS.STRIKETHROUGH,
        component: Strikethrough,
        handlers: {
            onKeyDown: buildMarkEventHandler(MARKS.STRIKETHROUGH)
        },
        deserializeHtml: {
            rules: [
                {
                    validNodeName: [
                        'S'
                    ]
                }
            ]
        }
    });
