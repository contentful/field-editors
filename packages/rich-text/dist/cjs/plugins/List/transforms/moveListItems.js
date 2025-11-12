"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "moveListItems", {
    enumerable: true,
    get: function() {
        return moveListItems;
    }
});
const _platelist = require("@udecode/plate-list");
const _internal = require("../../../internal");
const _queries = require("../../../internal/queries");
const _moveListItemDown = require("./moveListItemDown");
const moveListItems = (editor, { increase = true, at = editor.selection ?? undefined } = {})=>{
    const _nodes = (0, _queries.getNodeEntries)(editor, {
        at,
        match: {
            type: (0, _queries.getPluginType)(editor, _platelist.ELEMENT_LIC)
        }
    });
    const lics = Array.from(_nodes);
    if (!lics.length) return;
    const highestLicPaths = [];
    const highestLicPathRefs = [];
    lics.forEach((lic)=>{
        const licPath = lic[1];
        const liPath = (0, _queries.getParentPath)(licPath);
        const isAncestor = highestLicPaths.some((path)=>{
            const highestLiPath = (0, _queries.getParentPath)(path);
            return (0, _queries.isAncestorPath)(highestLiPath, liPath);
        });
        if (!isAncestor) {
            highestLicPaths.push(licPath);
            highestLicPathRefs.push((0, _queries.createPathRef)(editor, licPath));
        }
    });
    const licPathRefsToMove = increase ? highestLicPathRefs : highestLicPathRefs.reverse();
    (0, _internal.withoutNormalizing)(editor, ()=>{
        licPathRefsToMove.forEach((licPathRef)=>{
            const licPath = licPathRef.unref();
            if (!licPath) return;
            const liEntry = (0, _platelist.getListItemEntry)(editor, {
                at: licPath
            });
            if (!liEntry) {
                return;
            }
            if (increase) {
                (0, _moveListItemDown.moveListItemDown)(editor, liEntry);
            } else if ((0, _platelist.isListNested)(editor, liEntry.list[1])) {
                (0, _platelist.moveListItemUp)(editor, liEntry);
            }
        });
    });
};
