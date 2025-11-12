import * as React from 'react';
export declare const styles: {
    icon: string;
};
interface EmbeddedBlockToolbarIconProps {
    isDisabled: boolean;
    nodeType: string;
    onClose: () => void;
}
export declare function EmbeddedBlockToolbarIcon({ isDisabled, nodeType, onClose, }: EmbeddedBlockToolbarIconProps): React.JSX.Element;
export {};
