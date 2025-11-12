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
    createPasteHTMLPlugin: function() {
        return createPasteHTMLPlugin;
    },
    ensureXSlateFragment: function() {
        return ensureXSlateFragment;
    },
    getSlateFragmentAttribute: function() {
        return getSlateFragmentAttribute;
    }
});
const _platecommon = require("@udecode/plate-common");
const _sanitizeHTML = require("./utils/sanitizeHTML");
const catchSlateFragment = /data-slate-fragment="(.+?)"/m;
const getSlateFragmentAttribute = (dataTransfer)=>{
    const htmlData = dataTransfer.getData('text/html');
    const [, fragment] = htmlData.match(catchSlateFragment) || [];
    return fragment;
};
const ensureXSlateFragment = (dataTransfer)=>{
    if (!dataTransfer.getData('application/x-slate-fragment')) {
        const fragment = getSlateFragmentAttribute(dataTransfer);
        if (fragment) {
            const clipboardData = new DataTransfer();
            dataTransfer.types.forEach((type)=>{
                clipboardData.setData(type, dataTransfer.getData(type));
            });
            clipboardData.setData('application/x-slate-fragment', fragment);
            return clipboardData;
        }
    }
    return dataTransfer;
};
const createPasteHTMLPlugin = ()=>({
        key: 'PasteHTMLPlugin',
        withOverrides: (editor)=>{
            const { insertData } = editor;
            editor.insertData = (data)=>insertData(ensureXSlateFragment(data));
            return editor;
        },
        inject: {
            pluginsByKey: {
                [_platecommon.KEY_DESERIALIZE_HTML]: {
                    editor: {
                        insertData: {
                            format: 'text/html',
                            transformData: _sanitizeHTML.sanitizeHTML
                        }
                    }
                }
            }
        }
    });
