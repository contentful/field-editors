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
    usePlateEditorRef: function() {
        return usePlateEditorRef;
    },
    usePlateEditorState: function() {
        return usePlateEditorState;
    },
    usePlateSelectors: function() {
        return usePlateSelectors;
    },
    useReadOnly: function() {
        return useReadOnly;
    }
});
const _platecommon = /*#__PURE__*/ _interop_require_wildcard(require("@udecode/plate-common"));
const _slatereact = /*#__PURE__*/ _interop_require_wildcard(require("slate-react"));
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
const useReadOnly = _slatereact.useReadOnly;
const usePlateEditorRef = (id)=>{
    return _platecommon.useEditorRef(id);
};
const usePlateEditorState = (id)=>{
    return _platecommon.useEditorState(id);
};
const usePlateSelectors = (id)=>{
    return _platecommon.usePlateSelectors(id);
};
