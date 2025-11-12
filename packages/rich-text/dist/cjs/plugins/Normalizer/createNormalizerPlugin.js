"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createNormalizerPlugin", {
    enumerable: true,
    get: function() {
        return createNormalizerPlugin;
    }
});
const _withNormalizer = require("./withNormalizer");
const createNormalizerPlugin = ()=>({
        key: 'NormalizerPlugin',
        withOverrides: _withNormalizer.withNormalizer
    });
