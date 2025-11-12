import React from 'react';
import { css } from 'emotion';
import { IS_CHROME } from '../../helpers/environment';
import { getLinkEntityId } from './utils';
const styles = {
    root: css({
        marginBottom: '1.25rem !important',
        display: 'block'
    }),
    container: css({
        display: 'inline-block',
        verticalAlign: 'text-top',
        width: '100%'
    })
};
export function LinkedBlockWrapper({ attributes, card, children, link }) {
    return /*#__PURE__*/ React.createElement("div", {
        ...attributes,
        className: styles.root,
        "data-entity-type": link.sys.linkType,
        "data-entity-id": getLinkEntityId(link),
        contentEditable: IS_CHROME ? undefined : false,
        draggable: IS_CHROME ? true : undefined
    }, /*#__PURE__*/ React.createElement("div", {
        contentEditable: IS_CHROME ? false : undefined,
        draggable: IS_CHROME ? true : undefined,
        className: styles.container
    }, card), children);
}
