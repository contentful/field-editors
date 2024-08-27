import React from 'react';

import { useSelected, useReadOnly } from 'slate-react';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { Element, findNodePath, removeNodes, RenderElementProps } from '../../internal';
import { useSdkContext } from '../../SdkProvider';
import { useLinkTracking } from '../links-tracking';
import { FetchingWrappedResourceCard } from '../shared/FetchingWrappedResourceCard';
import { LinkedBlockWrapper } from '../shared/LinkedBlockWrapper';

export type LinkedResourceBlockProps = {
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
  attributes: Pick<RenderElementProps, 'attributes'>;
  children: React.ReactNode;
};

export function LinkedResourceBlock(props: LinkedResourceBlockProps) {
  const { attributes, children, element } = props;
  const { onEntityFetchComplete } = useLinkTracking();
  const isSelected = useSelected();
  const editor = useContentfulEditor();
  const sdk = useSdkContext();
  const isDisabled = useReadOnly();
  const link = element.data.target.sys;

  const handleRemoveClick = React.useCallback(() => {
    if (!editor) return;
    const pathToElement = findNodePath(editor, element);
    removeNodes(editor, { at: pathToElement });
  }, [editor, element]);

  return (
    <LinkedBlockWrapper
      attributes={attributes}
      link={element.data.target}
      card={
        <FetchingWrappedResourceCard
          sdk={sdk}
          link={link}
          isDisabled={isDisabled}
          isSelected={isSelected}
          onRemove={handleRemoveClick}
          onEntityFetchComplete={onEntityFetchComplete}
        />
      }
    >
      {children}
    </LinkedBlockWrapper>
  );
}
