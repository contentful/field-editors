import { PlateEditor } from '../../internal/types';
import type { NodeTransformer } from '../Normalizer';
export declare function addTableTrackingEvents(editor: PlateEditor): void;
export declare const withInvalidCellChildrenTracking: (transformer: NodeTransformer) => NodeTransformer;
