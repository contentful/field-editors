import * as Contentful from '@contentful/rich-text-types';
import { Value } from './internal/types';
export type SyncEditorStateProps = {
    incomingValue?: Value;
    onChange?: (doc: Contentful.Document) => unknown;
};
/**
 * A void component that's responsible for keeping the editor
 * state in sync with incoming changes (aka. external updates) and
 * triggering onChange events.
 *
 * This component is a hack to work around the limitation of Plate v17+
 * where we can no longer access the editor instance outside the Plate
 * provider.
 */
export declare const SyncEditorChanges: ({ incomingValue, onChange }: SyncEditorStateProps) => null;
