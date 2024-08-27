import * as React from 'react';

import { Link } from '@contentful/app-sdk';
import { Text } from '@contentful/f36-components';

import { Element, RenderElementProps } from '../../../internal/types';
import { useLinkTracking } from '../../links-tracking';
import { useEntityInfo } from '../useEntityInfo';
import { handleEditLink, handleRemoveLink } from './linkHandlers';
import { LinkPopover } from './LinkPopover';
import { styles } from './styles';
import { useHyperlinkCommon } from './useHyperlinkCommon';

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
  children: React.ReactNode;
  onEntityFetchComplete: VoidFunction;
};

export function EntityHyperlink(props: HyperlinkElementProps) {
  const { editor, sdk, isLinkFocused, pathToElement, isEditorFocused } = useHyperlinkCommon(
    props.element
  );
  const { onEntityFetchComplete } = useLinkTracking();
  const { target } = props.element.data;

  const tooltipContent = useEntityInfo({
    target,
    sdk,
    onEntityFetchComplete,
  });

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
        data-link-type={target.sys.linkType}
        data-link-id={target.sys.id}
      >
        {props.children}
      </Text>
    </LinkPopover>
  );
}
