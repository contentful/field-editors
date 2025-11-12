"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useLinkTracking", {
    enumerable: true,
    get: function() {
        return useLinkTracking;
    }
});
const _react = require("react");
const _ContentfulEditorProvider = require("../ContentfulEditorProvider");
function useLinkTracking() {
    const editor = (0, _ContentfulEditorProvider.useContentfulEditorRef)();
    return {
        onEntityFetchComplete: (0, _react.useCallback)(()=>editor?.tracking.onViewportAction('linkRendered'), [
            editor
        ])
    };
}
