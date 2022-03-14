import * as React from 'react';

import { FieldExtensionSDK, Link } from '@contentful/app-sdk';
import { Tooltip, TextLink } from '@contentful/f36-components';
import { useReadOnly } from 'slate-react';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { useSdkContext } from '../../../SdkProvider';
import { CustomRenderElementProps } from '../../../types';
import { addOrEditLink } from '../HyperlinkModal';
import { styles } from './styles';

type HyperlinkElementProps = CustomRenderElementProps<{
  uri?: string;
  target?: Link;
  onEntityFetchComplete?: VoidFunction;
}>;

export function UrlHyperlink(props: HyperlinkElementProps) {
  const editor = useContentfulEditor();
  const isReadOnly = useReadOnly();
  const sdk: FieldExtensionSDK = useSdkContext();
  const { uri } = props.element.data;

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!editor) return;
    addOrEditLink(editor, sdk, editor.tracking.onViewportAction);
  }

  return (
    <Tooltip
      content={uri}
      targetWrapperClassName={styles.hyperlinkWrapper}
      placement="bottom"
      maxWidth="auto">
      <TextLink
        as="a"
        href={uri}
        rel="noopener noreferrer"
        onClick={handleClick}
        isDisabled={isReadOnly}
        className={styles.hyperlink}>
        {props.children}
      </TextLink>
    </Tooltip>
  );
}
