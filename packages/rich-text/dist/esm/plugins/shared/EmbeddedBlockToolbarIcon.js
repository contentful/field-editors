import * as React from 'react';
import { Flex, Menu } from '@contentful/f36-components';
import { Icon } from '@contentful/f36-components';
import { ImageSquareIcon, EmbeddedBlockIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { BLOCKS } from '@contentful/rich-text-types';
import { css } from 'emotion';
import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { useSdkContext } from '../../SdkProvider';
import { selectEntityAndInsert, selectResourceEntityAndInsert } from '../shared/EmbeddedBlockUtil';
import { ResourceNewBadge } from './ResourceNewBadge';
export const styles = {
    icon: css({
        marginRight: '10px'
    })
};
export function EmbeddedBlockToolbarIcon({ isDisabled, nodeType, onClose }) {
    const editor = useContentfulEditor();
    const sdk = useSdkContext();
    const handleClick = async (event)=>{
        event.preventDefault();
        if (!editor) {
            return;
        }
        onClose();
        if (nodeType == BLOCKS.EMBEDDED_RESOURCE) {
            await selectResourceEntityAndInsert(sdk, editor, editor.tracking.onToolbarAction);
        } else {
            await selectEntityAndInsert(nodeType, sdk, editor, editor.tracking.onToolbarAction);
        }
    };
    const type = getEntityTypeFromNodeType(nodeType);
    const baseClass = `rich-text__${nodeType}`;
    return /*#__PURE__*/ React.createElement(Menu.Item, {
        disabled: isDisabled,
        className: `${baseClass}-list-item`,
        onClick: handleClick,
        testId: `toolbar-toggle-${nodeType}`
    }, /*#__PURE__*/ React.createElement(Flex, {
        alignItems: "center",
        flexDirection: "row"
    }, /*#__PURE__*/ React.createElement(Icon, {
        as: type === 'Asset' ? ImageSquareIcon : EmbeddedBlockIcon,
        className: `rich-text__embedded-entry-list-icon ${styles.icon}`,
        color: tokens.gray900
    }), /*#__PURE__*/ React.createElement("span", null, type, nodeType == BLOCKS.EMBEDDED_RESOURCE && /*#__PURE__*/ React.createElement(ResourceNewBadge, null))));
}
function getEntityTypeFromNodeType(nodeType) {
    const words = nodeType.toLowerCase().split('-');
    if (words.includes('entry') || words.includes('resource')) {
        return 'Entry';
    }
    if (words.includes('asset')) {
        return 'Asset';
    }
    throw new Error(`Node type \`${nodeType}\` has no associated \`entityType\``);
}
