import React from 'react';

import { ResourceLink } from '@contentful/field-editor-reference';
import { useSelected, useReadOnly } from 'slate-react';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { Element, findNodePath, removeNodes, RenderElementProps } from '../../internal';
import { useSdkContext } from '../../SdkProvider';
import { useLinkTracking } from '../links-tracking';
import { LinkedInlineWrapper } from '../shared/LinkedInlineWrapper';
import { FetchingWrappedResourceInlineCard } from './FetchingWrappedResourceInlineCard';

export type LinkedResourceInlineProps = {
  element: Element & {
    data: {
      target: ResourceLink<'Contentful:Entry'>;
    };
  };
  attributes: Pick<RenderElementProps, 'attributes'>;
  children: React.ReactNode;
};

export function LinkedResourceInline(props: LinkedResourceInlineProps) {
  const { attributes, children, element } = props;
  const { onEntityFetchComplete } = useLinkTracking();
  const isSelected = useSelected();
  const editor = useContentfulEditor();
  const sdk = useSdkContext();
  const isDisabled = useReadOnly();
  const link = element.data.target.sys;

  function handleRemoveClick() {
    if (!editor) return;
    const pathToElement = findNodePath(editor, element);
    removeNodes(editor, { at: pathToElement });
  }

  return (
    <LinkedInlineWrapper
      attributes={attributes}
      link={element.data.target}
      card={
        <FetchingWrappedResourceInlineCard
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
    </LinkedInlineWrapper>
  );
}
