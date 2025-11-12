"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "randomId", {
    enumerable: true,
    get: function() {
        return randomId;
    }
});
const randomId = (prefix = '')=>{
    return `${prefix}-${(Math.random() + 1).toString(36).substring(10)}`;
};
