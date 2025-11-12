import * as p from '@udecode/plate-common';
import * as sr from 'slate-react';
export const useReadOnly = sr.useReadOnly;
export const usePlateEditorRef = (id)=>{
    return p.useEditorRef(id);
};
export const usePlateEditorState = (id)=>{
    return p.useEditorState(id);
};
export const usePlateSelectors = (id)=>{
    return p.usePlateSelectors(id);
};
