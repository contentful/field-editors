import * as React from 'react';

import { Link } from '@contentful/app-sdk';
import { Text } from '@contentful/f36-components';

import { Element, RenderElementProps } from '../../../internal/types';
import { useLinkTracking } from '../../links-tracking';
import { useResourceEntityInfo } from '../useResourceEntityInfo';
import { handleEditLink, handleRemoveLink } from './linkHandlers';
import { LinkPopover } from './LinkPopover';
import { styles } from './styles';
import { useHyperlinkCommon } from './useHyperlinkCommon';

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
  children: React.ReactNode;
};

export function ResourceHyperlink(props: ResourceHyperlinkProps) {
  const { editor, sdk, isLinkFocused, pathToElement, isEditorFocused } = useHyperlinkCommon(
    props.element
  );
  const { onEntityFetchComplete } = useLinkTracking();
  const { target } = props.element.data;

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
      isEditorFocused={isEditorFocused}
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
