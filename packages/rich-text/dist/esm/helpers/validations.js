import { BLOCKS, INLINES, TOP_LEVEL_BLOCKS } from '@contentful/rich-text-types';
import find from 'lodash/find';
import flow from 'lodash/flow';
import get from 'lodash/get';
export const VALIDATIONS = {
    ENABLED_MARKS: 'enabledMarks',
    ENABLED_NODE_TYPES: 'enabledNodeTypes'
};
export const DEFAULT_ENABLED_NODE_TYPES = [
    BLOCKS.DOCUMENT,
    BLOCKS.PARAGRAPH,
    'text'
];
export const VALIDATABLE_NODE_TYPES = [].concat(TOP_LEVEL_BLOCKS).filter((type)=>type !== BLOCKS.PARAGRAPH).concat(Object.values(INLINES));
const getRichTextValidation = (field, validationType)=>flow((v)=>find(v, validationType), (v)=>get(v, validationType))(field.validations);
const isFormattingOptionEnabled = (field, validationType, nodeTypeOrMark)=>{
    const enabledFormattings = getRichTextValidation(field, validationType);
    if (enabledFormattings === undefined) {
        return true;
    }
    return DEFAULT_ENABLED_NODE_TYPES.concat(enabledFormattings).includes(nodeTypeOrMark);
};
export const isNodeTypeEnabled = (field, nodeType)=>isFormattingOptionEnabled(field, VALIDATIONS.ENABLED_NODE_TYPES, nodeType);
export const isMarkEnabled = (field, mark)=>isFormattingOptionEnabled(field, VALIDATIONS.ENABLED_MARKS, mark);
