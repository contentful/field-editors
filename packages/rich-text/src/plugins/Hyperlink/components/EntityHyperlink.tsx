import * as React from 'react';

import { FieldAppSDK, Link } from '@contentful/app-sdk';
import { Tooltip, TextLink } from '@contentful/f36-components';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { fromDOMPoint } from '../../../internal';
import { Element, RenderElementProps } from '../../../internal/types';
import { useSdkContext } from '../../../SdkProvider';
import { useLinkTracking } from '../../links-tracking';
import { addOrEditLink } from '../HyperlinkModal';
import { useEntityInfo } from '../useEntityInfo';
import { styles } from './styles';

export type HyperlinkElementProps = {
  element: Element & {
    data: {
      target: {
        sys: {
          id: string;
          linkType: 'Entry' | 'Asset';
          type: 'Link';
        };
      };
    };
  };
  target: Link;
  attributes: Pick<RenderElementProps, 'attributes'>;
  children: Pick<RenderElementProps, 'children'>;
  onEntityFetchComplete: VoidFunction;
};

export function EntityHyperlink(props: HyperlinkElementProps) {
  const editor = useContentfulEditor();
  const sdk: FieldAppSDK = useSdkContext();
  const { target } = props.element.data;
  const { onEntityFetchComplete } = useLinkTracking();

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

    const p = fromDOMPoint(editor, [event.target as Node, 0]);

    if (p) {
      addOrEditLink(editor, sdk, editor.tracking.onViewportAction, p.path);
    }
  }

  return (
    <Tooltip
      content={tooltipContent}
      targetWrapperClassName={styles.hyperlinkWrapper}
      placement="bottom"
      maxWidth="auto"
    >
      <TextLink
        as="a"
        onClick={handleClick}
        className={styles.hyperlink}
        data-link-type={target.sys.linkType}
        data-link-id={target.sys.id}
      >
        {props.children}
      </TextLink>
    </Tooltip>
  );
}
