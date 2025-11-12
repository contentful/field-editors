import * as React from 'react';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import { trimLeadingSlash } from '../utils/trimLeadingSlash';
import { CommandList } from './CommandList';
const styles = {
    commandPrompt: css({
        color: tokens.blue400
    })
};
export const CommandPrompt = (props)=>{
    const query = React.useMemo(()=>trimLeadingSlash(props.text.text), [
        props.text.text
    ]);
    const editor = props.editor;
    const [textElement, setTextElement] = React.useState();
    return /*#__PURE__*/ React.createElement("span", {
        className: styles.commandPrompt,
        ref: (e)=>{
            setTextElement(e);
        },
        ...props.attributes
    }, props.children, /*#__PURE__*/ React.createElement(CommandList, {
        query: query,
        editor: editor,
        textContainer: textElement
    }));
};
