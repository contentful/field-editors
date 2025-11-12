"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getLinkEntityId: function() {
        return getLinkEntityId;
    },
    truncateTitle: function() {
        return truncateTitle;
    }
});
const isResourceLink = (link)=>!!link.sys.urn;
const getLinkEntityId = (link)=>isResourceLink(link) ? link.sys.urn : link.sys.id;
function truncateTitle(str, length) {
    if (typeof str === 'string' && str.length > length) {
        return str && str.substr(0, length + 1).replace(/(\s+\S(?=\S)|\s*)\.?.$/, '…');
    }
    return str;
}
