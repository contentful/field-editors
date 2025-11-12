import * as React from 'react';
import { MARKS } from '@contentful/rich-text-types';
import { PlatePlugin, RenderLeafProps } from '../../internal/types';
export declare const ToolbarDropdownStrikethroughButton: {
    ({ isDisabled }: {
        isDisabled?: boolean | undefined;
    }): React.JSX.Element | null;
    displayName: MARKS;
};
export declare const ToolbarStrikethroughButton: {
    ({ isDisabled }: {
        isDisabled?: boolean | undefined;
    }): React.JSX.Element | null;
    displayName: MARKS;
};
export declare function Strikethrough(props: RenderLeafProps): React.JSX.Element;
export declare const createStrikethroughPlugin: () => PlatePlugin;
