import * as React from 'react';
import { Text } from '@contentful/f36-components';
import { useLinkTracking } from '../../links-tracking';
import { useResourceEntityInfo } from '../useResourceEntityInfo';
import { handleEditLink, handleRemoveLink } from './linkHandlers';
import { LinkPopover } from './LinkPopover';
import { styles } from './styles';
import { useHyperlinkCommon } from './useHyperlinkCommon';
export function ResourceHyperlink(props) {
    const { editor, sdk, isLinkFocused, pathToElement, isEditorFocused } = useHyperlinkCommon(props.element);
    const { onEntityFetchComplete } = useLinkTracking();
    const { target } = props.element.data;
    const tooltipContent = useResourceEntityInfo({
        target,
        onEntityFetchComplete
    });
    if (!target) {
        return null;
    }
    const popoverText = /*#__PURE__*/ React.createElement(Text, {
        fontColor: "blue600",
        fontWeight: "fontWeightMedium",
        className: styles.openLink
    }, tooltipContent);
    return /*#__PURE__*/ React.createElement(LinkPopover, {
        isLinkFocused: isLinkFocused,
        handleEditLink: ()=>handleEditLink(editor, sdk, pathToElement),
        handleRemoveLink: ()=>handleRemoveLink(editor),
        popoverText: popoverText,
        isEditorFocused: isEditorFocused
    }, /*#__PURE__*/ React.createElement(Text, {
        testId: "cf-ui-text-link",
        fontColor: "blue600",
        fontWeight: "fontWeightMedium",
        className: styles.hyperlink,
        "data-resource-link-type": target.sys.linkType,
        "data-resource-link-urn": target.sys.urn
    }, props.children));
}
