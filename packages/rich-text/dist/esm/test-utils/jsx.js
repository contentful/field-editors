import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { createText } from '@udecode/plate-test-utils';
import { createHyperscript } from 'slate-hyperscript';
const voidChildren = [
    {
        text: ''
    }
];
const createCode = (_, attrs, children)=>{
    return createText('text', {
        code: true,
        ...attrs
    }, children);
};
const createSysLink = (linkType, id)=>({
        sys: {
            id,
            type: 'Link',
            linkType
        }
    });
const createSysResourceLink = (urn)=>({
        sys: {
            urn,
            type: 'ResourceLink',
            linkType: 'Contentful:Entry'
        }
    });
const createHyperlink = (_, attrs, children)=>{
    const data = {};
    let type = INLINES.HYPERLINK;
    if (attrs.uri) {
        data.uri = attrs.uri;
        type = INLINES.HYPERLINK;
    }
    if (attrs.asset) {
        type = INLINES.ASSET_HYPERLINK;
        data.target = createSysLink('Asset', attrs.asset);
    }
    if (attrs.entry) {
        type = INLINES.ENTRY_HYPERLINK;
        data.target = createSysLink('Entry', attrs.entry);
    }
    if (attrs.resource) {
        type = INLINES.RESOURCE_HYPERLINK;
        data.target = createSysResourceLink(attrs.resource);
    }
    children = children.map((child)=>typeof child === 'string' ? {
            text: child
        } : child);
    return {
        type,
        data,
        children
    };
};
const createInline = (_, attrs, children)=>{
    return {
        type: INLINES.EMBEDDED_ENTRY,
        data: {
            target: createSysLink('Entry', attrs.id)
        },
        isVoid: true,
        children: children.length > 0 ? children : voidChildren
    };
};
const createEmbeddedBlock = (_, attrs, children)=>{
    return {
        type: attrs.type === 'Entry' ? BLOCKS.EMBEDDED_ENTRY : BLOCKS.EMBEDDED_ASSET,
        data: {
            target: createSysLink(attrs.type, attrs.id)
        },
        isVoid: true,
        children: children.length > 0 ? children : voidChildren
    };
};
const createHR = (_, __, children)=>{
    return {
        type: BLOCKS.HR,
        data: {},
        isVoid: true,
        children: children.length > 0 ? children : voidChildren
    };
};
const createFragment = (_, __, children)=>{
    return children;
};
export const jsx = createHyperscript({
    elements: {
        hquote: {
            type: BLOCKS.QUOTE,
            data: {}
        },
        hh1: {
            type: BLOCKS.HEADING_1,
            data: {}
        },
        hh2: {
            type: BLOCKS.HEADING_2,
            data: {}
        },
        hh3: {
            type: BLOCKS.HEADING_3,
            data: {}
        },
        hh4: {
            type: BLOCKS.HEADING_4,
            data: {}
        },
        hh5: {
            type: BLOCKS.HEADING_5,
            data: {}
        },
        hh6: {
            type: BLOCKS.HEADING_6,
            data: {}
        },
        hli: {
            type: BLOCKS.LIST_ITEM,
            data: {}
        },
        hol: {
            type: BLOCKS.OL_LIST,
            data: {}
        },
        hp: {
            type: BLOCKS.PARAGRAPH,
            data: {}
        },
        htable: {
            type: BLOCKS.TABLE,
            data: {}
        },
        htd: {
            type: BLOCKS.TABLE_CELL,
            data: {}
        },
        hth: {
            type: BLOCKS.TABLE_HEADER_CELL,
            data: {}
        },
        htr: {
            type: BLOCKS.TABLE_ROW,
            data: {}
        },
        hul: {
            type: BLOCKS.UL_LIST,
            data: {}
        }
    },
    creators: {
        hlink: createHyperlink,
        hhr: createHR,
        htext: createText,
        hcode: createCode,
        hinline: createInline,
        hembed: createEmbeddedBlock,
        hfragment: createFragment
    }
});
