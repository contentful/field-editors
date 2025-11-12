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
        return _changed_assetjson.default;
    },
    created: function() {
        return _created_assetjson.default;
    },
    empty: function() {
        return _empty_assetjson.default;
    },
    invalid: function() {
        return _invalid_assetjson.default;
    },
    published: function() {
        return _published_assetjson.default;
    }
});
const _changed_assetjson = /*#__PURE__*/ _interop_require_default(require("./changed_asset.json"));
const _created_assetjson = /*#__PURE__*/ _interop_require_default(require("./created_asset.json"));
const _empty_assetjson = /*#__PURE__*/ _interop_require_default(require("./empty_asset.json"));
const _invalid_assetjson = /*#__PURE__*/ _interop_require_default(require("./invalid_asset.json"));
const _published_assetjson = /*#__PURE__*/ _interop_require_default(require("./published_asset.json"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
