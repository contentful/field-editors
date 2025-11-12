import { toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import { EMPTY_DOCUMENT } from '@contentful/rich-text-types';
import schema from '../constants/Schema';
const isTextElement = (node)=>'text' in node;
function sanitizeIncomingSlateDoc(nodes = []) {
    return nodes.map((node)=>{
        if (isTextElement(node)) {
            return node;
        }
        if (node.children?.length === 0) {
            return {
                ...node,
                children: [
                    {
                        text: '',
                        data: {}
                    }
                ]
            };
        }
        return {
            ...node,
            children: sanitizeIncomingSlateDoc(node?.children)
        };
    });
}
export const toSlateValue = (doc)=>{
    const hasContent = (doc)=>{
        return (doc?.content || []).length > 0;
    };
    const slateDoc = toSlatejsDocument({
        document: doc && hasContent(doc) ? doc : EMPTY_DOCUMENT,
        schema
    });
    return sanitizeIncomingSlateDoc(slateDoc);
};
