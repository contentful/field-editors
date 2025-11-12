import * as React from 'react';
interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    isDisabled?: boolean;
    children: any;
    title: string;
    className?: string;
    testId?: string;
}
export declare function ToolbarButton(props: ToolbarButtonProps): React.JSX.Element;
export {};
