"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "mockPlugin", {
    enumerable: true,
    get: function() {
        return mockPlugin;
    }
});
const _platecommon = require("@udecode/plate-common");
const _randomId = require("./randomId");
const mockPlugin = (p)=>(0, _platecommon.mockPlugin)({
        ...p,
        key: p.key || (0, _randomId.randomId)('plugin')
    });
