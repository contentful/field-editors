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
    assets: function() {
        return _asset;
    },
    contentTypes: function() {
        return _contenttype;
    },
    entries: function() {
        return _entry;
    },
    locales: function() {
        return _locale;
    },
    resources: function() {
        return _resources;
    },
    spaces: function() {
        return _space;
    }
});
const _asset = /*#__PURE__*/ _interop_require_wildcard(require("./asset"));
const _contenttype = /*#__PURE__*/ _interop_require_wildcard(require("./content-type"));
const _entry = /*#__PURE__*/ _interop_require_wildcard(require("./entry"));
const _locale = /*#__PURE__*/ _interop_require_wildcard(require("./locale"));
const _resources = /*#__PURE__*/ _interop_require_wildcard(require("./resources"));
const _space = /*#__PURE__*/ _interop_require_wildcard(require("./space"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
