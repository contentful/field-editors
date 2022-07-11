import * as React from 'react';

import { ALIGNMENT } from '../types';
import { Alignment } from '@udecode/plate-alignment';
// import { css, cx } from 'emotion';
import * as Slate from 'slate-react';

// const styles = {
//   [ALIGNMENT.LEFT]: css`
// 		display: flex;
// 		justify-content: left;
// 		background-color: green;
//   `,
//   [ALIGNMENT.CENTER]: css`
// 		display: flex;
// 		justify-content: center;
// 		background-color: green;
//   `,
//   [ALIGNMENT.RIGHT]: css`
// 		display: flex;
// 		justify-content: right;
// 		background-color: green;
//   `
// };

const styles = {
	left: {
		display: 'flex',
		justifyContent: 'left',
		backgroundColor: 'teal'
	},
	center: {
		display: 'flex',
		justifyContent: 'center',
		backgroundColor: 'teal'
	},
	right: {
		display: 'flex',
		justifyContent: 'right',
		backgroundColor: 'teal'
	}
}

function createAlignedText(alignment: Alignment) {
	return function AlignedText(props: Slate.RenderElementProps) {
		return (
			<div {...props.attributes} className={styles[alignment]}>
				{props.children}
			</div>
		)
	}
}

export const TextAlignedLeft = createAlignedText(ALIGNMENT.LEFT);
export const TextAlignedCenter = createAlignedText(ALIGNMENT.CENTER);
export const TextAlignedRight = createAlignedText(ALIGNMENT.RIGHT);