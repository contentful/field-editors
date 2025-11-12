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
    handleCopyLink: function() {
        return handleCopyLink;
    },
    handleEditLink: function() {
        return handleEditLink;
    },
    handleRemoveLink: function() {
        return handleRemoveLink;
    }
});
const _f36components = require("@contentful/f36-components");
const _editor = require("../../../helpers/editor");
const _HyperlinkModal = require("../HyperlinkModal");
const handleEditLink = (editor, sdk, pathToElement)=>{
    if (!editor || !pathToElement) return;
    (0, _HyperlinkModal.addOrEditLink)(editor, sdk, editor.tracking.onViewportAction, pathToElement);
};
const handleRemoveLink = (editor)=>{
    (0, _editor.unwrapLink)(editor);
};
const handleCopyLink = async (uri)=>{
    if (uri) {
        try {
            await navigator.clipboard.writeText(uri);
            _f36components.Notification.success('Successfully copied URL to clipboard');
        } catch (error) {
            _f36components.Notification.error('Failed to copy URL to clipboard');
        }
    }
};
