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
    IS_CHROME: function() {
        return IS_CHROME;
    },
    IS_SAFARI: function() {
        return IS_SAFARI;
    }
});
const IS_SAFARI = typeof navigator !== 'undefined' && /Version\/[\d.]+.*Safari/.test(navigator.userAgent);
const IS_CHROME = /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9.]+)(:?\s|$)/.test(navigator.userAgent);
