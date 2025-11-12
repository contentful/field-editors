import { isElement } from '../../internal/queries';
export class NormalizerError extends Error {
}
export const createValidatorFromTypes = (types)=>(_, [node])=>{
        return isElement(node) && types.includes(node.type);
    };
export const createTransformerFromObject = (transforms)=>{
    const fallback = transforms['default'];
    if (!fallback) {
        throw new NormalizerError('A default transformer MUST be provided');
    }
    return (editor, entry)=>{
        const [node] = entry;
        const key = isElement(node) ? node.type : 'default';
        const transformer = transforms[key] || fallback;
        return transformer(editor, entry);
    };
};
