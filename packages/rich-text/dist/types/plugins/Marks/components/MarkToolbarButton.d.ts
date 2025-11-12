import * as React from 'react';
import { MARKS } from '@contentful/rich-text-types';
export interface MarkOptions {
    mark: MARKS;
    title: string;
    icon?: React.ReactElement;
}
export declare const createMarkToolbarButton: ({ mark, title, icon }: MarkOptions) => {
    ({ isDisabled }: {
        isDisabled?: boolean | undefined;
    }): React.JSX.Element | null;
    displayName: MARKS;
};
