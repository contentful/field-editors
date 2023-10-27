import * as React from 'react';

import { Card } from '@contentful/f36-card';
import { SectionHeading } from '@contentful/f36-typography';
import { css } from 'emotion';

const styles = {
  card: css({
    position: 'relative',
  }),
};

export function UnsupportedEntityCard(props: { linkType: string; isSelected?: boolean }) {
  return (
    <Card className={styles.card} isSelected={props.isSelected}>
      <SectionHeading marginBottom="none">
        Resource type {props.linkType} is currently not supported
      </SectionHeading>
    </Card>
  );
}
