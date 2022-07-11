import { createAlignPlugin, KEY_ALIGN } from "@udecode/plate-alignment";
import {
	TextAlignedLeft,
	TextAlignedCenter,
	TextAlignedRight
} from "./components/AlignedText";
import { RichTextEditor, RichTextPlugin } from '../../types'
import { ALIGNMENT } from "./types";

export const createTextAlignmentPlugin = (): RichTextPlugin =>
	createAlignPlugin<RichTextEditor>({
		overrideByKey: {
			[ALIGNMENT.LEFT]: {
				type: ALIGNMENT.LEFT,
				component: TextAlignedLeft
			},
			[ALIGNMENT.CENTER]: {
				type: ALIGNMENT.CENTER,
				component: TextAlignedCenter
			},
			[ALIGNMENT.RIGHT]: {
				type: ALIGNMENT.RIGHT,
				component: TextAlignedRight
			}
		},
		deserializeHtml: {
			rules: [
				{ validNodeName: ['div'] },
				{
					validStyle: {
						display: 'flex',
						justifyContent: ['left, center', 'right']
					}
				}
			]
		}
	})