import * as React from 'react';
import { MARKS } from '@contentful/rich-text-types';
import { PlatePlugin, RenderLeafProps } from '../../internal/types';
export declare const ToolbarSubscriptButton: {
    ({ isDisabled }: {
        isDisabled?: boolean | undefined;
    }): React.JSX.Element | null;
    displayName: MARKS;
};
export declare const ToolbarDropdownSubscriptButton: {
    ({ isDisabled }: {
        isDisabled?: boolean | undefined;
    }): React.JSX.Element | null;
    displayName: MARKS;
};
export declare function Subscript(props: RenderLeafProps): React.JSX.Element;
export declare const createSubscriptPlugin: () => PlatePlugin;
