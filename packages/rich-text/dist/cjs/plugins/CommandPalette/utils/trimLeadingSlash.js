"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "trimLeadingSlash", {
    enumerable: true,
    get: function() {
        return trimLeadingSlash;
    }
});
function trimLeadingSlash(text) {
    if (!text.startsWith('/')) {
        return text;
    }
    return text.slice(1);
}
