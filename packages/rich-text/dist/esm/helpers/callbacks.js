import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import debounce from 'lodash/debounce';
import schema from '../constants/Schema';
import { removeInternalMarks } from './removeInternalMarks';
export const createOnChangeCallback = (handler)=>debounce((document)=>{
        const doc = removeInternalMarks(toContentfulDocument({
            document: document,
            schema: schema
        }));
        const cleanedDocument = removeInternalMarks(doc);
        handler?.(cleanedDocument);
    }, 500);
