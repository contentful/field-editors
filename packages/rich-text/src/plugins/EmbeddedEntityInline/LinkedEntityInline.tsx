import * as React from 'react';

import { EntryLink } from '@contentful/field-editor-reference';
import { useReadOnly, useSelected } from 'slate-react';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { focus } from '../../helpers/editor';
import { findNodePath } from '../../internal/queries';
import { removeNodes } from '../../internal/transforms';
import { Element, RenderElementProps } from '../../internal/types';
import { useSdkContext } from '../../SdkProvider';
import { useLinkTracking } from '../links-tracking';
import { LinkedInlineWrapper } from '../shared/LinkedInlineWrapper';
import { FetchingWrappedInlineEntryCard } from './FetchingWrappedInlineEntryCard';

type LinkedEntityInlineProps = {
  element: Element & {
    data: {
      target: EntryLink;
    };
  };
  attributes: Pick<RenderElementProps, 'attributes'>;
  children: Pick<RenderElementProps, 'children'>;
};

export function LinkedEntityInline(props: LinkedEntityInlineProps) {
  const { attributes, children, element } = props;
  const { onEntityFetchComplete } = useLinkTracking();
  const isSelected = useSelected();
  const editor = useContentfulEditor();
  const sdk = useSdkContext();
  const isDisabled = useReadOnly();
  const { id: entryId } = element.data.target.sys;

  function handleEditClick() {
    return sdk.navigator.openEntry(entryId, { slideIn: { waitForClose: true } }).then(() => {
      editor && focus(editor);
    });
  }

  function handleRemoveClick() {
    if (!editor) return;
    const pathToElement = findNodePath(editor, element);
    removeNodes(editor, { at: pathToElement });
  }

  return (
    <LinkedInlineWrapper
      attributes={attributes}
      card={
        <FetchingWrappedInlineEntryCard
          sdk={sdk}
          entryId={entryId}
          isSelected={isSelected}
          isDisabled={isDisabled}
          onRemove={handleRemoveClick}
          onEdit={handleEditClick}
          onEntityFetchComplete={onEntityFetchComplete}
        />
      }
      link={element.data.target}
    >
      {children}
    </LinkedInlineWrapper>
  );
}
