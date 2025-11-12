import * as React from 'react';
import { usePopper } from 'react-popper';
import { Popover, Stack, SectionHeading, ScreenReaderOnly, Flex, AssetIcon } from '@contentful/f36-components';
import { Portal } from '@contentful/f36-utils';
import { cx } from 'emotion';
import { useSdkContext } from '../../../SdkProvider';
import { useCommandList } from '../hooks/useCommandList';
import { useCommands } from '../useCommands';
import styles from './CommandList.styles';
const Group = ({ commandGroup, selectedItem })=>/*#__PURE__*/ React.createElement("section", {
        key: commandGroup.group
    }, /*#__PURE__*/ React.createElement(SectionHeading, {
        as: "h3",
        marginBottom: "spacingS",
        marginTop: "spacingS",
        marginLeft: "spacingM",
        marginRight: "spacingM"
    }, commandGroup.group), commandGroup.commands.map((command)=>/*#__PURE__*/ React.createElement("button", {
            key: command.id,
            id: command.id,
            className: cx(styles.menuItem, {
                [styles.menuItemSelected]: command.id === selectedItem
            }),
            onClick: command.callback
        }, command.label)), /*#__PURE__*/ React.createElement("hr", {
        className: styles.menuDivider,
        "aria-orientation": "horizontal"
    }));
const Asset = ({ command, selectedItem })=>/*#__PURE__*/ React.createElement("button", {
        key: command.id,
        id: command.id,
        className: cx(styles.menuItem, {
            [styles.menuItemSelected]: command.id === selectedItem
        }),
        onClick: command.callback
    }, /*#__PURE__*/ React.createElement(Flex, {
        alignItems: "center",
        gap: "spacingS"
    }, command.thumbnail ? /*#__PURE__*/ React.createElement("img", {
        width: "30",
        height: "30",
        src: command.thumbnail,
        alt: "",
        className: styles.thumbnail
    }) : /*#__PURE__*/ React.createElement(AssetIcon, {
        width: "30",
        height: "30",
        className: styles.thumbnail
    }), /*#__PURE__*/ React.createElement("span", null, command.label)));
const Item = ({ command, selectedItem })=>/*#__PURE__*/ React.createElement("button", {
        key: command.id,
        id: command.id,
        className: cx(styles.menuItem, {
            [styles.menuItemSelected]: command.id === selectedItem
        }),
        onClick: command.callback
    }, command.label);
const CommandListItems = ({ commandItems, selectedItem })=>{
    return /*#__PURE__*/ React.createElement(React.Fragment, null, commandItems.map((command)=>{
        return 'group' in command ? /*#__PURE__*/ React.createElement(Group, {
            key: command.group,
            commandGroup: command,
            selectedItem: selectedItem
        }) : command.asset ? /*#__PURE__*/ React.createElement(Asset, {
            key: command.id,
            command: command,
            selectedItem: selectedItem
        }) : /*#__PURE__*/ React.createElement(Item, {
            key: command.id,
            command: command,
            selectedItem: selectedItem
        });
    }));
};
export const CommandList = ({ query, editor, textContainer })=>{
    const sdk = useSdkContext();
    const popoverContainer = React.useRef(null);
    const popper = usePopper(textContainer, popoverContainer?.current, {
        placement: 'bottom-start'
    });
    const commandItems = useCommands(sdk, query, editor);
    const { selectedItem, isOpen } = useCommandList(commandItems, popoverContainer);
    if (!commandItems.length) {
        return null;
    }
    return /*#__PURE__*/ React.createElement("div", {
        className: styles.container,
        tabIndex: -1,
        contentEditable: false
    }, /*#__PURE__*/ React.createElement("div", {
        role: "alert"
    }, /*#__PURE__*/ React.createElement(ScreenReaderOnly, null, "Richtext commands. Currently focused item: ", selectedItem, ". Press ", /*#__PURE__*/ React.createElement("kbd", null, "enter"), " to select, ", /*#__PURE__*/ React.createElement("kbd", null, "arrows"), " to navigate, ", /*#__PURE__*/ React.createElement("kbd", null, "escape"), " to close.")), /*#__PURE__*/ React.createElement(Portal, null, /*#__PURE__*/ React.createElement("div", {
        "aria-hidden": true,
        ref: popoverContainer,
        className: styles.menuPoper,
        style: popper.styles.popper,
        ...popper.attributes.popper
    }, /*#__PURE__*/ React.createElement(Popover, {
        isOpen: isOpen,
        usePortal: false,
        autoFocus: false
    }, /*#__PURE__*/ React.createElement(Popover.Trigger, null, /*#__PURE__*/ React.createElement("span", null)), /*#__PURE__*/ React.createElement(Popover.Content, {
        className: styles.menuContent,
        testId: "rich-text-commands"
    }, /*#__PURE__*/ React.createElement("header", {
        className: styles.menuHeader
    }, /*#__PURE__*/ React.createElement(SectionHeading, {
        marginBottom: "none"
    }, "Richtext commands")), /*#__PURE__*/ React.createElement("div", {
        className: styles.menuList,
        "data-test-id": "rich-text-commands-list"
    }, /*#__PURE__*/ React.createElement(CommandListItems, {
        commandItems: commandItems,
        selectedItem: selectedItem
    })), /*#__PURE__*/ React.createElement("footer", {
        className: styles.menuFooter
    }, /*#__PURE__*/ React.createElement(Stack, {
        as: "ul",
        margin: "none",
        padding: "none",
        spacing: "spacingS",
        className: styles.footerList
    }, /*#__PURE__*/ React.createElement("li", null, /*#__PURE__*/ React.createElement("kbd", null, "↑"), /*#__PURE__*/ React.createElement("kbd", null, "↓"), " to navigate"), /*#__PURE__*/ React.createElement("li", null, /*#__PURE__*/ React.createElement("kbd", null, "↵"), " to confirm"), /*#__PURE__*/ React.createElement("li", null, /*#__PURE__*/ React.createElement("kbd", null, "esc"), " to close"))))))));
};
