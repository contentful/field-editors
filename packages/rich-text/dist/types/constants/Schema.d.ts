import { BLOCKS, INLINES } from '@contentful/rich-text-types';
declare const _default: {
    document: {
        nodes: {
            types: {
                type: import("@contentful/rich-text-types").TopLevelBlockEnum;
            }[];
        }[];
    };
    blocks: {
        blockquote: {
            nodes: {
                match: {
                    type: BLOCKS;
                }[][];
                min: number;
            }[];
            normalize: (editor: any, error: any) => any;
        };
        paragraph: {
            nodes: {
                match: ({
                    type: INLINES;
                } | {
                    object: string;
                })[];
            }[];
        };
        "heading-1": {
            nodes: {
                match: ({
                    type: INLINES;
                } | {
                    object: string;
                })[];
            }[];
        };
        "heading-2": {
            nodes: {
                match: ({
                    type: INLINES;
                } | {
                    object: string;
                })[];
            }[];
        };
        "heading-3": {
            nodes: {
                match: ({
                    type: INLINES;
                } | {
                    object: string;
                })[];
            }[];
        };
        "heading-4": {
            nodes: {
                match: ({
                    type: INLINES;
                } | {
                    object: string;
                })[];
            }[];
        };
        "heading-5": {
            nodes: {
                match: ({
                    type: INLINES;
                } | {
                    object: string;
                })[];
            }[];
        };
        "heading-6": {
            nodes: {
                match: ({
                    type: INLINES;
                } | {
                    object: string;
                })[];
            }[];
        };
    };
    inlines: {
        hyperlink: {
            nodes: {
                match: {
                    object: string;
                }[];
            }[];
        };
        "entry-hyperlink": {
            nodes: {
                match: {
                    object: string;
                }[];
            }[];
        };
        "resource-hyperlink": {
            nodes: {
                match: {
                    object: string;
                }[];
            }[];
        };
        "asset-hyperlink": {
            nodes: {
                match: {
                    object: string;
                }[];
            }[];
        };
        "embedded-entry-inline": {
            isVoid: boolean;
        };
        "embedded-resource-inline": {
            isVoid: boolean;
        };
    };
};
export default _default;
