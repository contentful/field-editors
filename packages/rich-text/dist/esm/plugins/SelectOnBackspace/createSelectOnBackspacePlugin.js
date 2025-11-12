import { INLINES } from '@contentful/rich-text-types';
import { createSelectOnBackspacePlugin as createDefaultSelectPlugin } from '@udecode/plate-select';
export const createSelectOnBackspacePlugin = ()=>createDefaultSelectPlugin({
        options: {
            query: {
                allow: [
                    INLINES.EMBEDDED_ENTRY
                ]
            }
        }
    });
