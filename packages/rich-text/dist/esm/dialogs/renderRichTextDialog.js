import * as React from 'react';
import { HyperlinkDialog } from './HypelinkDialog/HyperlinkDialog';
export const renderRichTextDialog = (sdk)=>{
    const parameters = sdk.parameters.invocation;
    if (parameters?.type === 'rich-text-hyperlink-dialog') {
        sdk.window.startAutoResizer();
        return /*#__PURE__*/ React.createElement(HyperlinkDialog, {
            ...parameters,
            onClose: sdk.close,
            sdk: sdk
        });
    }
    return /*#__PURE__*/ React.createElement("div", null);
};
