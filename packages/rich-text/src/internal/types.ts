/**
 * Re-exporting Plate/Slate TypeScript Types to reduce the blast
 * radius of version upgrades
 */
import { TEditor } from '@udecode/plate-core';
import { CustomElement } from 'types';

export type { Location } from 'slate';

export type BaseEditor = TEditor<CustomElement[]>;
