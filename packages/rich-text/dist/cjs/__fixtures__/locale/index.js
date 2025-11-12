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
    englishDefault: function() {
        return _english_default_localejson.default;
    },
    german: function() {
        return _german_localejson.default;
    },
    list: function() {
        return list;
    }
});
const _english_default_localejson = /*#__PURE__*/ _interop_require_default(require("./english_default_locale.json"));
const _german_localejson = /*#__PURE__*/ _interop_require_default(require("./german_locale.json"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const list = {
    sys: {
        type: 'Array'
    },
    total: 2,
    skip: 0,
    limit: 100,
    items: [
        _english_default_localejson.default,
        _german_localejson.default
    ]
};
