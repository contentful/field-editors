import * as React from 'react';
import { MARKS } from '@contentful/rich-text-types';
import { PlatePlugin, RenderLeafProps } from '../../internal/types';
export declare const ToolbarSuperscriptButton: {
    ({ isDisabled }: {
        isDisabled?: boolean | undefined;
    }): React.JSX.Element | null;
    displayName: MARKS;
};
export declare const ToolbarDropdownSuperscriptButton: {
    ({ isDisabled }: {
        isDisabled?: boolean | undefined;
    }): React.JSX.Element | null;
    displayName: MARKS;
};
export declare function Superscript(props: RenderLeafProps): React.JSX.Element;
export declare const createSuperscriptPlugin: () => PlatePlugin;
