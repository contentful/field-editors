import * as React from 'react';

import tokens from '@contentful/f36-tokens';
import { EntryLink, ResourceLink } from '@contentful/field-editor-reference';
import { css } from 'emotion';

import { IS_CHROME } from '../../helpers/environment';
import { RenderElementProps } from '../../internal/types';

const styles = {
  icon: css({
    marginRight: '10px',
  }),

  root: css({
    display: 'inline-block',
    margin: `0 ${tokens.spacing2Xs}`,
    fontSize: 'inherit',
    span: {
      userSelect: 'none',
    },
  }),
};

const isResourceLink = (link: EntryLink | ResourceLink): link is ResourceLink =>
  !!(link as ResourceLink).sys.urn;

type LinkedInlineWrapperProps = React.PropsWithChildren<{
  attributes: Pick<RenderElementProps, 'attributes'>;
  card: JSX.Element;
  link: ResourceLink | EntryLink;
}>;

export function LinkedInlineWrapper({
  attributes,
  card,
  children,
  link,
}: LinkedInlineWrapperProps) {
  return (
    <span
      {...attributes}
      className={styles.root}
      data-entity-type={link.sys.linkType}
      data-entity-id={isResourceLink(link) ? link.sys.urn : link.sys.id}
      // COMPAT: This makes copy & paste work for Firefox
      contentEditable={IS_CHROME ? undefined : false}
      draggable={IS_CHROME ? true : undefined}
    >
      <span
        // COMPAT: This makes copy & paste work for Chromium/Blink browsers and Safari
        contentEditable={IS_CHROME ? false : undefined}
        draggable={IS_CHROME ? true : undefined}
      >
        {card}
      </span>
      {children}
    </span>
  );
}
