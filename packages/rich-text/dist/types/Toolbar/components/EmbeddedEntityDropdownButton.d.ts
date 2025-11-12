import * as React from 'react';
export interface EmbeddedEntityDropdownButtonProps {
    children: React.ReactNode;
    isDisabled: boolean | undefined;
    isOpen: boolean;
    onClose: () => void;
    onToggle: () => void;
}
export declare function EmbeddedEntityDropdownButton({ children, isDisabled, isOpen, onClose, onToggle, }: EmbeddedEntityDropdownButtonProps): React.JSX.Element;
