import React from 'react';

import { Card, SectionHeading } from '@contentful/f36-components';
import { css } from 'emotion';

const styles = {
  card: css({
    position: 'relative',
  }),
};

export function UnsupportedEntityCard(props: { entityType: string }) {
  return (
    <Card className={styles.card}>
      <SectionHeading marginBottom="none">
        Resource type {props.entityType} is currently not supported
      </SectionHeading>
    </Card>
  );
}
