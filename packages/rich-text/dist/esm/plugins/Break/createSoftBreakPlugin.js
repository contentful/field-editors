import { createSoftBreakPlugin as createDefaultSoftBreakPlugin } from '@udecode/plate-break';
export const createSoftBreakPlugin = ()=>createDefaultSoftBreakPlugin({
        then: (editor)=>{
            const rules = editor.plugins.flatMap((p)=>{
                return p.softBreak || [];
            });
            return {
                options: {
                    rules
                }
            };
        }
    });
