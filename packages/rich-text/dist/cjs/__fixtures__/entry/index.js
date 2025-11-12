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
    changed: function() {
        return _changed_entryjson.default;
    },
    empty: function() {
        return _empty_entryjson.default;
    },
    invalid: function() {
        return _invalid_entryjson.default;
    },
    published: function() {
        return _published_entryjson.default;
    }
});
const _changed_entryjson = /*#__PURE__*/ _interop_require_default(require("./changed_entry.json"));
const _empty_entryjson = /*#__PURE__*/ _interop_require_default(require("./empty_entry.json"));
const _invalid_entryjson = /*#__PURE__*/ _interop_require_default(require("./invalid_entry.json"));
const _published_entryjson = /*#__PURE__*/ _interop_require_default(require("./published_entry.json"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
