import { INLINES } from '@contentful/rich-text-types';
export declare function createInlineEntryNode(id: string): {
    type: INLINES;
    children: {
        text: string;
    }[];
    data: {
        target: {
            sys: {
                id: string;
                type: string;
                linkType: string;
            };
        };
    };
};
