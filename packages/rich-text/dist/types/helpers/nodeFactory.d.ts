export function document(...content: any[]): {
    nodeType: string;
    content: any[];
    data: {};
};
export function block(nodeType: any, data: any, ...content: any[]): {
    nodeType: any;
    content: any[];
    data: any;
};
export function inline(nodeType: any, data: any, ...content: any[]): {
    nodeType: any;
    content: any[];
    data: any;
};
export function text(value?: string, marks?: any[]): {
    nodeType: string;
    value: string;
    marks: any[];
    data: {};
};
export function mark(type: any): {
    type: any;
};
