import * as React from 'react';
import { Button, Menu } from '@contentful/f36-components';
import { CaretDownIcon, PlusIcon } from '@contentful/f36-icons';
export function EmbeddedEntityDropdownButton({ children, isDisabled, isOpen, onClose, onToggle }) {
    return /*#__PURE__*/ React.createElement(Menu, {
        placement: "bottom-end",
        isOpen: isOpen,
        onClose: onClose,
        onOpen: onToggle
    }, /*#__PURE__*/ React.createElement(Menu.Trigger, null, /*#__PURE__*/ React.createElement(Button, {
        endIcon: /*#__PURE__*/ React.createElement(CaretDownIcon, null),
        testId: "toolbar-entity-dropdown-toggle",
        variant: "secondary",
        size: "small",
        startIcon: /*#__PURE__*/ React.createElement(PlusIcon, null),
        isDisabled: isDisabled
    }, "Embed")), /*#__PURE__*/ React.createElement(Menu.List, {
        className: "toolbar-entity-dropdown-list"
    }, children));
}
