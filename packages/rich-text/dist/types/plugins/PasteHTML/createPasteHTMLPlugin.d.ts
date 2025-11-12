import { PlatePlugin } from '../../internal/types';
export declare const getSlateFragmentAttribute: (dataTransfer: DataTransfer) => string | void;
/**
 * Get the x-slate-fragment attribute that exist in text/html data
 * and append it to the DataTransfer object
 */
export declare const ensureXSlateFragment: (dataTransfer: DataTransfer) => DataTransfer;
export declare const createPasteHTMLPlugin: () => PlatePlugin;
