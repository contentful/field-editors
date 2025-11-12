"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "withNormalizer", {
    enumerable: true,
    get: function() {
        return withNormalizer;
    }
});
const _isplainobj = /*#__PURE__*/ _interop_require_default(require("is-plain-obj"));
const _transformers = require("../../helpers/transformers");
const _internal = require("../../internal");
const _queries = require("../../internal/queries");
const _baseRules = require("./baseRules");
const _utils = require("./utils");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const withNormalizer = (editor)=>{
    const rules = _baseRules.baseRules;
    for (const p of editor.plugins){
        const { normalizer: _rules } = p;
        if (!_rules) {
            continue;
        }
        for (const _rule of _rules){
            const rule = {
                ..._rule
            };
            if (!rule.match && !p.isElement) {
                throw new _utils.NormalizerError('rule.match MUST be defined in a non-element plugin');
            }
            if (!rule.match) {
                rule.match = {
                    type: (0, _queries.getPluginType)(editor, p.key)
                };
            }
            if ((0, _isplainobj.default)(rule.transform)) {
                if ('validNode' in rule) {
                    throw new _utils.NormalizerError('conditional transformations are not supported in validNode rules');
                }
                rule.transform = (0, _utils.createTransformerFromObject)({
                    default: _transformers.transformRemove,
                    ...rule.transform
                });
            }
            if (!rule.transform) {
                rule.transform = _transformers.transformRemove;
            }
            if ('validChildren' in rule && Array.isArray(rule.validChildren)) {
                rule.validChildren = (0, _utils.createValidatorFromTypes)(rule.validChildren);
            }
            rules.push(rule);
        }
    }
    const _transform = (tr, entry)=>{
        (0, _internal.withoutNormalizing)(editor, ()=>{
            tr(editor, entry);
        });
    };
    const { normalizeNode } = editor;
    editor.normalizeNode = (entry)=>{
        const [node, path] = entry;
        const children = (0, _queries.getChildren)(entry);
        for (const rule of rules){
            if (!(0, _queries.matchNode)(node, path, rule.match)) {
                continue;
            }
            if ('validNode' in rule && !rule.validNode(editor, entry)) {
                _transform(rule.transform, entry);
                return;
            }
            if ('validChildren' in rule) {
                const isValidChild = rule.validChildren;
                const invalidChildEntry = children.find((entry)=>!isValidChild(editor, entry));
                if (invalidChildEntry) {
                    _transform(rule.transform, invalidChildEntry);
                    return;
                }
            }
        }
        return normalizeNode(entry);
    };
    return editor;
};
