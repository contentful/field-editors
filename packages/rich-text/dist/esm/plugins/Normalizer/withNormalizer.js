import isPlainObject from 'is-plain-obj';
import { transformRemove } from '../../helpers/transformers';
import { withoutNormalizing } from '../../internal';
import { getChildren, matchNode, getPluginType } from '../../internal/queries';
import { baseRules } from './baseRules';
import { NormalizerError, createValidatorFromTypes, createTransformerFromObject } from './utils';
export const withNormalizer = (editor)=>{
    const rules = baseRules;
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
                throw new NormalizerError('rule.match MUST be defined in a non-element plugin');
            }
            if (!rule.match) {
                rule.match = {
                    type: getPluginType(editor, p.key)
                };
            }
            if (isPlainObject(rule.transform)) {
                if ('validNode' in rule) {
                    throw new NormalizerError('conditional transformations are not supported in validNode rules');
                }
                rule.transform = createTransformerFromObject({
                    default: transformRemove,
                    ...rule.transform
                });
            }
            if (!rule.transform) {
                rule.transform = transformRemove;
            }
            if ('validChildren' in rule && Array.isArray(rule.validChildren)) {
                rule.validChildren = createValidatorFromTypes(rule.validChildren);
            }
            rules.push(rule);
        }
    }
    const _transform = (tr, entry)=>{
        withoutNormalizing(editor, ()=>{
            tr(editor, entry);
        });
    };
    const { normalizeNode } = editor;
    editor.normalizeNode = (entry)=>{
        const [node, path] = entry;
        const children = getChildren(entry);
        for (const rule of rules){
            if (!matchNode(node, path, rule.match)) {
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
