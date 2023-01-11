import * as React from 'react';

import { FieldExtensionSDK, Link } from '@contentful/app-sdk';
import { Tooltip, TextLink } from '@contentful/f36-components';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { fromDOMPoint } from '../../../internal';
import { CustomRenderElementProps } from '../../../internal/types';
import { useSdkContext } from '../../../SdkProvider';
import { addOrEditLink } from '../HyperlinkModal';
import { styles } from './styles';

type HyperlinkElementProps = CustomRenderElementProps<{
  uri?: string;
  target?: Link;
  onEntityFetchComplete?: VoidFunction;
}>;

export function UrlHyperlink(props: HyperlinkElementProps) {
  const editor = useContentfulEditor();
  const sdk: FieldExtensionSDK = useSdkContext();
  const { uri } = props.element.data;

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!editor) return;
    const p = fromDOMPoint(editor, [event.target as Node, 0], {
      exactMatch: false,
      suppressThrow: false,
    });
    addOrEditLink(editor, sdk, editor.tracking.onViewportAction, p?.path);
  }

  return (
    <Tooltip
      content={uri}
      targetWrapperClassName={styles.hyperlinkWrapper}
      placement="bottom"
      maxWidth="auto"
    >
      <TextLink
        as="a"
        href={uri}
        rel="noopener noreferrer"
        onClick={handleClick}
        className={styles.hyperlink}
      >
        {props.children}
      </TextLink>
    </Tooltip>
  );
}
