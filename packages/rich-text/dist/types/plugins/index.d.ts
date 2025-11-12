import { FieldAppSDK } from '@contentful/app-sdk';
import { PlateProps } from '@udecode/plate-common';
import { PlatePlugin } from '../internal/types';
import { RichTextTrackingActionHandler } from './Tracking';
export declare const getPlugins: (sdk: FieldAppSDK, onAction: RichTextTrackingActionHandler, restrictedMarks?: string[]) => PlatePlugin[];
export declare const disableCorePlugins: PlateProps['disableCorePlugins'];
