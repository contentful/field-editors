import * as React from 'react';

import { FieldAppSDK, Link } from '@contentful/app-sdk';
import { Text } from '@contentful/f36-components';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { findNodePath, isChildPath } from '../../../internal/queries';
import { Element, RenderElementProps } from '../../../internal/types';
import { useSdkContext } from '../../../SdkProvider';
import { useLinkTracking } from '../../links-tracking';
import { useResourceEntityInfo } from '../useResourceEntityInfo';
import { handleEditLink, handleRemoveLink } from './linkHandlers';
import { LinkPopover } from './LinkPopover';
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
};

export function ResourceHyperlink(props: ResourceHyperlinkProps) {
  const editor = useContentfulEditor();
  const sdk: FieldAppSDK = useSdkContext();
  const focus = editor.selection?.focus;
  const { target } = props.element.data;
  const { onEntityFetchComplete } = useLinkTracking();
  const pathToElement = findNodePath(editor, props.element);
  const isLinkFocused = pathToElement && focus && isChildPath(focus.path, pathToElement);

  const tooltipContent = useResourceEntityInfo({ target, onEntityFetchComplete });

  if (!target) {
    return null;
  }

  const popoverText = (
    <Text fontColor="blue600" fontWeight="fontWeightMedium" className={styles.openLink}>
      {tooltipContent}
    </Text>
  );

  return (
    <LinkPopover
      isLinkFocused={isLinkFocused}
      handleEditLink={() => handleEditLink(editor, sdk, pathToElement)}
      handleRemoveLink={() => handleRemoveLink(editor)}
      popoverText={popoverText}
    >
      <Text
        testId="cf-ui-text-link"
        fontColor="blue600"
        fontWeight="fontWeightMedium"
        className={styles.hyperlink}
        data-resource-link-type={target.sys.linkType}
        data-resource-link-urn={target.sys.urn}
      >
        {props.children}
      </Text>
    </LinkPopover>
  );
}
