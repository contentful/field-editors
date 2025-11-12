import * as React from 'react';
import { usePlateActions } from '@udecode/plate-common';
import equal from 'fast-deep-equal';
import { createOnChangeCallback } from './helpers/callbacks';
import { usePlateSelectors } from './internal/hooks';
import { setEditorValue } from './internal/transforms';
const useAcceptIncomingChanges = (incomingValue)=>{
    const editor = usePlateSelectors().editor();
    const lastIncomingValue = React.useRef(incomingValue);
    React.useEffect(()=>{
        if (equal(lastIncomingValue.current, incomingValue)) {
            return;
        }
        lastIncomingValue.current = incomingValue;
        setEditorValue(editor, incomingValue);
    }, [
        editor,
        incomingValue
    ]);
};
const useOnValueChanged = (onChange)=>{
    const editor = usePlateSelectors().editor();
    const setEditorOnChange = usePlateActions().onChange();
    React.useEffect(()=>{
        const cb = createOnChangeCallback(onChange);
        setEditorOnChange((document)=>{
            const operations = editor?.operations.filter((op)=>{
                return op.type !== 'set_selection';
            });
            if (operations.length === 0) {
                return;
            }
            cb(document);
        });
    }, [
        editor,
        onChange,
        setEditorOnChange
    ]);
};
export const SyncEditorChanges = ({ incomingValue, onChange })=>{
    useAcceptIncomingChanges(incomingValue);
    useOnValueChanged(onChange);
    return null;
};
