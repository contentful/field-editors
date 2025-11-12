"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
_export_star(require("./addRow"), exports);
_export_star(require("./addColumn"), exports);
_export_star(require("./setHeader"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}
