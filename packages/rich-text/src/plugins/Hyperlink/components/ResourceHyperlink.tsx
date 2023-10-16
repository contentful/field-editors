import * as React from 'react';

import { FieldAppSDK, Link } from '@contentful/app-sdk';
import { Tooltip, TextLink } from '@contentful/f36-components';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { fromDOMPoint } from '../../../internal';
import { Element, RenderElementProps } from '../../../internal/types';
import { useSdkContext } from '../../../SdkProvider';
import { addOrEditLink } from '../HyperlinkModal';
import { useResourceEntityInfo } from '../useResourceEntityInfo';
import { styles } from './styles';

export type ResourceHyperlinkProps = {
  element: Element & {
    data: {
      target: {
        sys: {
          urn: string;
          linkType: 'Contentful:Entry';
          type: 'ResourceLink';
        };
      };
    };
  };
  target: Link;
  attributes: Pick<RenderElementProps, 'attributes'>;
  children: Pick<RenderElementProps, 'children'>;
  onEntityFetchComplete: VoidFunction;
};

export function ResourceHyperlink(props: ResourceHyperlinkProps) {
  const editor = useContentfulEditor();
  const sdk: FieldAppSDK = useSdkContext();
  const { target } = props.element.data;

  const tooltipContent = useResourceEntityInfo(target);

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
        data-resource-link-type={target.sys.linkType}
        data-resource-link-urn={target.sys.urn}
      >
        {props.children}
      </TextLink>
    </Tooltip>
  );
}
