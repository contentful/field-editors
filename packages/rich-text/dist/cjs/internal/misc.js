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
    blurEditor: function() {
        return blurEditor;
    },
    createPlateEditor: function() {
        return createPlateEditor;
    },
    focusEditor: function() {
        return focusEditor;
    },
    fromDOMPoint: function() {
        return fromDOMPoint;
    },
    mockPlugin: function() {
        return mockPlugin;
    },
    normalizeInitialValue: function() {
        return normalizeInitialValue;
    },
    selectEditor: function() {
        return selectEditor;
    }
});
const _platecommon = /*#__PURE__*/ _interop_require_wildcard(require("@udecode/plate-common"));
const _transforms = require("./transforms");
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
const createPlateEditor = (options = {})=>{
    return _platecommon.createPlateEditor(options);
};
const normalizeInitialValue = (options, initialValue)=>{
    const editor = createPlateEditor(options);
    if (initialValue) {
        editor.children = initialValue;
    }
    (0, _transforms.normalize)(editor, {
        force: true
    });
    return editor.children;
};
const focusEditor = (editor, target)=>{
    _platecommon.focusEditor(editor, target);
};
const blurEditor = (editor)=>{
    _platecommon.blurEditor(editor);
};
const selectEditor = (editor, opts)=>{
    _platecommon.selectEditor(editor, opts);
};
const fromDOMPoint = (editor, domPoint, opts = {
    exactMatch: false,
    suppressThrow: false
})=>{
    return _platecommon.toSlatePoint(editor, domPoint, opts);
};
const mockPlugin = (plugin)=>{
    return _platecommon.mockPlugin(plugin);
};
