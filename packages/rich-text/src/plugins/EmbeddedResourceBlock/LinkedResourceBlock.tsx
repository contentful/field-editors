import React from 'react';

import { css } from 'emotion';
import { useSelected, useReadOnly } from 'slate-react';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { IS_CHROME } from '../../helpers/environment';
import { Element, findNodePath, removeNodes, RenderElementProps } from '../../internal';
import { useSdkContext } from '../../SdkProvider';
import { useLinkTracking } from '../links-tracking';
import { FetchingWrappedResourceCard } from '../shared/FetchingWrappedResourceCard';

const styles = {
  root: css({
    marginBottom: '1.25rem !important',
    display: 'block',
  }),
  container: css({
    // The next 2 properties ensure Entity card won't be aligned above
    // a list item marker (i.e. bullet)
    display: 'inline-block',
    verticalAlign: 'text-top',
    width: '100%',
  }),
};

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
  children: Pick<RenderElementProps, 'children'>;
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
    <div
      {...attributes}
      className={styles.root}
      data-entity-type={link.linkType}
      data-entity-id={link.urn}
      // COMPAT: This makes copy & paste work for Firefox
      contentEditable={IS_CHROME ? undefined : false}
      draggable={IS_CHROME ? true : undefined}
    >
      <div
        // COMPAT: This makes copy & paste work for Chromium/Blink browsers and Safari
        contentEditable={IS_CHROME ? false : undefined}
        draggable={IS_CHROME ? true : undefined}
        className={styles.container}
      >
        <FetchingWrappedResourceCard
          sdk={sdk}
          link={link}
          isDisabled={isDisabled}
          isSelected={isSelected}
          onRemove={handleRemoveClick}
          onEntityFetchComplete={onEntityFetchComplete}
        />
      </div>
      {children}
    </div>
  );
}
