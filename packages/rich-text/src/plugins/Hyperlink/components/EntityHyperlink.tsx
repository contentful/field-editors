import * as React from 'react';

import { FieldExtensionSDK, Link } from '@contentful/app-sdk';
import { Tooltip, TextLink } from '@contentful/f36-components';
import { ReactEditor, useReadOnly } from 'slate-react';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { useSdkContext } from '../../../SdkProvider';
import { CustomRenderElementProps } from '../../../types';
import { addOrEditLink } from '../HyperlinkModal';
import { useEntityInfo } from '../useEntityInfo';
import { styles } from './styles';

type HyperlinkElementProps = CustomRenderElementProps<{
  uri?: string;
  target?: Link;
  onEntityFetchComplete?: VoidFunction;
}>;

export function EntityHyperlink(props: HyperlinkElementProps) {
  const editor = useContentfulEditor();
  const isReadOnly = useReadOnly();
  const sdk: FieldExtensionSDK = useSdkContext();
  const { target } = props.element.data;
  const { onEntityFetchComplete } = props;

  const tooltipContent = useEntityInfo({
    target,
    sdk,
    onEntityFetchComplete,
  });

  if (!target) return null;

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!editor) return;
    const p = ReactEditor.toSlatePoint(editor, [event.target as Node, 0], {
      exactMatch: false,
      suppressThrow: false,
    });
    addOrEditLink(editor, sdk, editor.tracking.onViewportAction, p.path);
  }

  return (
    <Tooltip
      content={tooltipContent}
      targetWrapperClassName={styles.hyperlinkWrapper}
      placement="bottom"
      maxWidth="auto">
      <TextLink
        as="a"
        onClick={handleClick}
        isDisabled={isReadOnly}
        className={styles.hyperlink}
        data-link-type={target.sys.linkType}
        data-link-id={target.sys.id}>
        {props.children}
      </TextLink>
    </Tooltip>
  );
}
