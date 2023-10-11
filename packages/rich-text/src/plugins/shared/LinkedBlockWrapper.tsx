import React from 'react';

import { EntityLink, ResourceLink } from '@contentful/field-editor-reference';
import { css } from 'emotion';

import { IS_CHROME } from '../../helpers/environment';
import { RenderElementProps } from '../../internal';

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

const isResourceLink = (link: EntityLink | ResourceLink): link is ResourceLink =>
  !!(link as ResourceLink).sys.urn;

type LinkedBlockWrapperProps = React.PropsWithChildren<{
  attributes: Pick<RenderElementProps, 'attributes'>;
  card: JSX.Element;
  link: ResourceLink | EntityLink;
}>;

export function LinkedBlockWrapper({ attributes, card, children, link }: LinkedBlockWrapperProps) {
  return (
    <div
      {...attributes}
      className={styles.root}
      data-entity-type={link.sys.linkType}
      data-entity-id={isResourceLink(link) ? link.sys.urn : link.sys.id}
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
        {card}
      </div>
      {children}
    </div>
  );
}
