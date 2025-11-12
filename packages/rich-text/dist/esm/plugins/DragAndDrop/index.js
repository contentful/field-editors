import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { getNodeEntries } from '../../internal/queries';
export function createDragAndDropPlugin() {
    const DRAGGABLE_TYPES = [
        BLOCKS.EMBEDDED_ENTRY,
        BLOCKS.EMBEDDED_ASSET,
        BLOCKS.EMBEDDED_RESOURCE,
        BLOCKS.HR,
        INLINES.EMBEDDED_ENTRY,
        INLINES.EMBEDDED_RESOURCE
    ];
    const ON_DROP_ALLOWED_TYPES = {
        TABLE: [
            INLINES.EMBEDDED_ENTRY,
            INLINES.EMBEDDED_RESOURCE
        ]
    };
    return {
        key: 'DragAndDropPlugin',
        handlers: {
            onDrop: (editor)=>(event)=>{
                    const [draggingBlock] = Array.from(getNodeEntries(editor, {
                        match: (node)=>DRAGGABLE_TYPES.includes(node.type)
                    }));
                    if (!draggingBlock) return false;
                    const [draggingNode] = draggingBlock;
                    if (!event.nativeEvent.target) return false;
                    const dropDisallowed = getParents(event.nativeEvent.target).some((node)=>{
                        return ON_DROP_ALLOWED_TYPES[node.nodeName] ? !ON_DROP_ALLOWED_TYPES[node.nodeName]?.includes(draggingNode.type) : false;
                    });
                    if (!dropDisallowed) {
                        editor.history.undos.push({
                            operations: [],
                            selectionBefore: null
                        });
                    }
                    return dropDisallowed;
                }
        }
    };
}
function getParents(el) {
    const parents = [];
    parents.push(el);
    while(el.parentNode){
        parents.unshift(el.parentNode);
        el = el.parentNode;
    }
    return parents;
}
