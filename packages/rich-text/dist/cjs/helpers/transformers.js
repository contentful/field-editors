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
    transformLift: function() {
        return transformLift;
    },
    transformParagraphs: function() {
        return transformParagraphs;
    },
    transformRemove: function() {
        return transformRemove;
    },
    transformUnwrap: function() {
        return transformUnwrap;
    },
    transformWrapIn: function() {
        return transformWrapIn;
    }
});
const _transforms = require("../internal/transforms");
const _extractNodes = require("./extractNodes");
const transformRemove = (editor, [, path])=>{
    (0, _transforms.removeNodes)(editor, {
        at: path
    });
};
const transformParagraphs = (editor, entry)=>{
    const path = entry[1];
    const nodes = (0, _extractNodes.extractParagraphs)(editor, path);
    transformRemove(editor, entry);
    (0, _transforms.insertNodes)(editor, nodes, {
        at: path
    });
};
const transformUnwrap = (editor, [, path])=>{
    (0, _transforms.unwrapNodes)(editor, {
        at: path
    });
};
const transformWrapIn = (type)=>(editor, [, path])=>{
        (0, _transforms.wrapNodes)(editor, {
            type,
            data: {},
            children: []
        }, {
            at: path
        });
    };
const transformLift = (editor, [, path])=>{
    (0, _transforms.liftNodes)(editor, {
        at: path
    });
};
