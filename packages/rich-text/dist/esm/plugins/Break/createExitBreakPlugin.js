import { createExitBreakPlugin as createDefaultExitBreakPlugin } from '@udecode/plate-break';
export const createExitBreakPlugin = ()=>createDefaultExitBreakPlugin({
        options: {
            rules: []
        },
        then: (editor)=>{
            const rules = editor.plugins.flatMap((p)=>{
                return p.exitBreak || [];
            });
            return {
                options: {
                    rules
                }
            };
        }
    });
