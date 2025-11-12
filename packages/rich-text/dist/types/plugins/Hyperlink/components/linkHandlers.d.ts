import { FieldAppSDK } from '@contentful/app-sdk';
import { Path, PlateEditor } from '../../../internal/types';
export declare const handleEditLink: (editor: PlateEditor, sdk: FieldAppSDK, pathToElement: Path | undefined) => void;
export declare const handleRemoveLink: (editor: PlateEditor) => void;
export declare const handleCopyLink: (uri: string | undefined) => Promise<void>;
