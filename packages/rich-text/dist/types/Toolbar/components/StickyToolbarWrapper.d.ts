import React, { ReactNode } from 'react';
type StickyToolbarProps = {
    isDisabled?: boolean;
    offset?: number;
    children: ReactNode;
};
declare const StickyToolbarWrapper: ({ isDisabled, offset, children }: StickyToolbarProps) => React.JSX.Element;
export default StickyToolbarWrapper;
