import { FieldAPI } from '@contentful/app-sdk';
/**
 * Returns a config for the entity selector based on a given rich text field and a
 * rich text node type that the entity should be picked for. Takes the field
 * validations for the given node type into account.
 *
 * @param {object} field
 * @param {string} nodeType
 * @returns {object}
 */
type EntitySelectorConfig = {
    entityType: string;
    locale: string | null;
    contentTypes: string[];
};
export declare const newEntitySelectorConfigFromRichTextField: (field: FieldAPI, nodeType: any) => EntitySelectorConfig;
/**
 * Returns a config for the entity selector based on a given rich text field and a
 * rich text node type that the entity should be picked for. Takes the field
 * validations for the given node type into account.
 *
 * @param {object} field
 * @param {string} nodeType
 * @returns {object}
 */
export declare const newResourceEntitySelectorConfigFromRichTextField: (field: any, nodeType: any) => {
    allowedResources: {
        type: "Contentful:Entry";
        source: string;
        contentTypes: string[];
    }[];
    locale: any;
};
export {};
