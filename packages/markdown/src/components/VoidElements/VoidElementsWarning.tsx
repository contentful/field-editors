import React from 'react';
import { useVoidElements } from './useVoidElements';
import { Note, Paragraph, TextLink } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';

import { css } from 'emotion';

const styles = {
  note: css({
    margin: `${tokens.spacingM} 0`
  }),
  paragraph: css({
    '&:not(:last-child)': {
      paddingBottom: tokens.spacingS
    }
  })
};

export function VoidElementsWarning() {
  const { isEmpty } = useVoidElements();

  if (isEmpty) {
    return null;
  }

  return (
    <Note noteType="warning" hasCloseButton={false} className={styles.note} testId="markdown-void-elements-warning">
      <Paragraph className={styles.paragraph}>
        Your markdown contains <TextLink linkType="primary" icon="ExternalLink" iconPosition="right" target="_blank"
                                         href="https://www.w3.org/TR/2011/WD-html-markup-20110113/syntax.html#void-element">void
        elements</TextLink> that causes the preview to skip those parts.
      </Paragraph>
      <Paragraph className={styles.paragraph}>
        This indicates incorrect usage of one or more of the following HTML elements: area, base, br, col, command,
        embed, hr, img, input, keygen, link, meta, param, source, track, wbr.In order to properly display the preview
        fix the elements or replace them with alternatives.
      </Paragraph>
    </Note>
  );
}
