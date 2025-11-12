import find from 'lodash/find';
import flow from 'lodash/flow';
import get from 'lodash/get';
export default function getAllowedResourcesForNodeType(field, nodeType) {
    return flow((validations)=>find(validations, 'nodes'), (validations)=>get(validations, [
            'nodes',
            nodeType,
            'allowedResources'
        ], []))(field.validations);
}
