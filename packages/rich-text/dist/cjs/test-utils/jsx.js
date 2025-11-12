"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "jsx", {
    enumerable: true,
    get: function() {
        return jsx;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _platetestutils = require("@udecode/plate-test-utils");
const _slatehyperscript = require("slate-hyperscript");
const voidChildren = [
    {
        text: ''
    }
];
const createCode = (_, attrs, children)=>{
    return (0, _platetestutils.createText)('text', {
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
    let type = _richtexttypes.INLINES.HYPERLINK;
    if (attrs.uri) {
        data.uri = attrs.uri;
        type = _richtexttypes.INLINES.HYPERLINK;
    }
    if (attrs.asset) {
        type = _richtexttypes.INLINES.ASSET_HYPERLINK;
        data.target = createSysLink('Asset', attrs.asset);
    }
    if (attrs.entry) {
        type = _richtexttypes.INLINES.ENTRY_HYPERLINK;
        data.target = createSysLink('Entry', attrs.entry);
    }
    if (attrs.resource) {
        type = _richtexttypes.INLINES.RESOURCE_HYPERLINK;
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
        type: _richtexttypes.INLINES.EMBEDDED_ENTRY,
        data: {
            target: createSysLink('Entry', attrs.id)
        },
        isVoid: true,
        children: children.length > 0 ? children : voidChildren
    };
};
const createEmbeddedBlock = (_, attrs, children)=>{
    return {
        type: attrs.type === 'Entry' ? _richtexttypes.BLOCKS.EMBEDDED_ENTRY : _richtexttypes.BLOCKS.EMBEDDED_ASSET,
        data: {
            target: createSysLink(attrs.type, attrs.id)
        },
        isVoid: true,
        children: children.length > 0 ? children : voidChildren
    };
};
const createHR = (_, __, children)=>{
    return {
        type: _richtexttypes.BLOCKS.HR,
        data: {},
        isVoid: true,
        children: children.length > 0 ? children : voidChildren
    };
};
const createFragment = (_, __, children)=>{
    return children;
};
const jsx = (0, _slatehyperscript.createHyperscript)({
    elements: {
        hquote: {
            type: _richtexttypes.BLOCKS.QUOTE,
            data: {}
        },
        hh1: {
            type: _richtexttypes.BLOCKS.HEADING_1,
            data: {}
        },
        hh2: {
            type: _richtexttypes.BLOCKS.HEADING_2,
            data: {}
        },
        hh3: {
            type: _richtexttypes.BLOCKS.HEADING_3,
            data: {}
        },
        hh4: {
            type: _richtexttypes.BLOCKS.HEADING_4,
            data: {}
        },
        hh5: {
            type: _richtexttypes.BLOCKS.HEADING_5,
            data: {}
        },
        hh6: {
            type: _richtexttypes.BLOCKS.HEADING_6,
            data: {}
        },
        hli: {
            type: _richtexttypes.BLOCKS.LIST_ITEM,
            data: {}
        },
        hol: {
            type: _richtexttypes.BLOCKS.OL_LIST,
            data: {}
        },
        hp: {
            type: _richtexttypes.BLOCKS.PARAGRAPH,
            data: {}
        },
        htable: {
            type: _richtexttypes.BLOCKS.TABLE,
            data: {}
        },
        htd: {
            type: _richtexttypes.BLOCKS.TABLE_CELL,
            data: {}
        },
        hth: {
            type: _richtexttypes.BLOCKS.TABLE_HEADER_CELL,
            data: {}
        },
        htr: {
            type: _richtexttypes.BLOCKS.TABLE_ROW,
            data: {}
        },
        hul: {
            type: _richtexttypes.BLOCKS.UL_LIST,
            data: {}
        }
    },
    creators: {
        hlink: createHyperlink,
        hhr: createHR,
        htext: _platetestutils.createText,
        hcode: createCode,
        hinline: createInline,
        hembed: createEmbeddedBlock,
        hfragment: createFragment
    }
});
