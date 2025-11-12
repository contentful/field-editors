import { isRootLevel } from '../../helpers/editor';
import { isFirstChildPath } from '../../internal/queries';
export const createVoidsPlugin = ()=>({
        key: 'VoidsPlugin',
        exitBreak: [
            {
                hotkey: 'enter',
                before: true,
                query: {
                    filter: ([node, path])=>isRootLevel(path) && isFirstChildPath(path) && !!node.isVoid
                }
            },
            {
                hotkey: 'enter',
                level: -2,
                query: {
                    filter: ([node, path])=>!(isRootLevel(path) && isFirstChildPath(path)) && !!node.isVoid
                }
            }
        ]
    });
