import * as React from 'react';

import { Card, SectionHeading } from '@contentful/f36-components';
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
