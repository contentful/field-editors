import * as React from 'react';
import { MARKS } from '@contentful/rich-text-types';
import { PlatePlugin, RenderLeafProps } from '../../internal/types';
export declare const ToolbarBoldButton: {
    ({ isDisabled }: {
        isDisabled?: boolean | undefined;
    }): React.JSX.Element | null;
    displayName: MARKS;
};
export declare function Bold(props: RenderLeafProps): React.JSX.Element;
export declare const createBoldPlugin: () => PlatePlugin;
