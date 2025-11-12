import * as React from 'react';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import { IS_CHROME } from '../../helpers/environment';
import { getLinkEntityId } from './utils';
const styles = {
    icon: css({
        marginRight: '10px'
    }),
    root: css({
        display: 'inline-block',
        margin: `0 ${tokens.spacing2Xs}`,
        fontSize: 'inherit',
        span: {
            userSelect: 'none'
        }
    })
};
export function LinkedInlineWrapper({ attributes, card, children, link }) {
    return /*#__PURE__*/ React.createElement("span", {
        ...attributes,
        className: styles.root,
        "data-entity-type": link.sys.linkType,
        "data-entity-id": getLinkEntityId(link),
        contentEditable: IS_CHROME ? undefined : false,
        draggable: IS_CHROME ? true : undefined
    }, /*#__PURE__*/ React.createElement("span", {
        contentEditable: IS_CHROME ? false : undefined,
        draggable: IS_CHROME ? true : undefined
    }, card), children);
}
