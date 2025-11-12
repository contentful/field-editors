import { KEY_DESERIALIZE_HTML } from '@udecode/plate-common';
import { sanitizeHTML } from './utils/sanitizeHTML';
const catchSlateFragment = /data-slate-fragment="(.+?)"/m;
export const getSlateFragmentAttribute = (dataTransfer)=>{
    const htmlData = dataTransfer.getData('text/html');
    const [, fragment] = htmlData.match(catchSlateFragment) || [];
    return fragment;
};
export const ensureXSlateFragment = (dataTransfer)=>{
    if (!dataTransfer.getData('application/x-slate-fragment')) {
        const fragment = getSlateFragmentAttribute(dataTransfer);
        if (fragment) {
            const clipboardData = new DataTransfer();
            dataTransfer.types.forEach((type)=>{
                clipboardData.setData(type, dataTransfer.getData(type));
            });
            clipboardData.setData('application/x-slate-fragment', fragment);
            return clipboardData;
        }
    }
    return dataTransfer;
};
export const createPasteHTMLPlugin = ()=>({
        key: 'PasteHTMLPlugin',
        withOverrides: (editor)=>{
            const { insertData } = editor;
            editor.insertData = (data)=>insertData(ensureXSlateFragment(data));
            return editor;
        },
        inject: {
            pluginsByKey: {
                [KEY_DESERIALIZE_HTML]: {
                    editor: {
                        insertData: {
                            format: 'text/html',
                            transformData: sanitizeHTML
                        }
                    }
                }
            }
        }
    });
