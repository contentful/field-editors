import englishDefault from './english_default_locale.json';
import german from './german_locale.json';
declare const list: {
    sys: {
        type: string;
    };
    total: number;
    skip: number;
    limit: number;
    items: {
        sys: {
            id: string;
            type: string;
            createdAt: string;
            updatedAt: string;
            version: number;
            space: {
                sys: {
                    type: string;
                    linkType: string;
                    id: string;
                };
            };
            environment: {
                sys: {
                    id: string;
                    type: string;
                    linkType: string;
                };
            };
        };
        name: string;
        code: string;
        internal_code: string;
        fallbackCode: null;
        contentDeliveryApi: boolean;
        contentManagementApi: boolean;
        default: boolean;
        optional: boolean;
    }[];
};
export { englishDefault, german, list };
