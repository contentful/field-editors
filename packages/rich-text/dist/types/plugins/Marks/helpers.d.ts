import { MARKS } from '@contentful/rich-text-types';
import { PlateEditor, HotkeyPlugin, KeyboardHandler } from '../../internal/types';
export declare const toggleMarkAndDeactivateConflictingMarks: (editor: PlateEditor, mark: MARKS) => void;
export declare const buildMarkEventHandler: (type: MARKS) => KeyboardHandler<HotkeyPlugin>;
