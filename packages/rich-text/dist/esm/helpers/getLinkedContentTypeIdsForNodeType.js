import find from 'lodash/find';
import flow from 'lodash/flow';
import get from 'lodash/get';
export default function getLinkedContentTypeIdsForNodeType(field, nodeType) {
    return flow((v)=>find(v, 'nodes'), (v)=>get(v, [
            'nodes',
            nodeType
        ]), (v)=>find(v, 'linkContentType'), (v)=>get(v, 'linkContentType', []))(field.validations);
}
