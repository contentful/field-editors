/* eslint-disable jsx-a11y/no-static-element-interactions */
import * as React from 'react';

import { FieldAPI } from '@contentful/app-sdk';
import {
  CopyButton,
  Flex,
  Heading,
  SectionHeading,
  Subheading,
  Textarea,
} from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import type { Meta, StoryObj } from '@storybook/react';
import { css } from 'emotion';

import ClipboardCapture from '../src/ClipboardCapture.mdx';

const meta: Meta<typeof ClipboardCapture> = {
  title: 'utilities/ClipboardCapture',
  component: ClipboardCapture,
};

export default meta;

type Story = StoryObj<typeof ClipboardCapture>;

declare global {
  interface Window {
    actions: any[];
    richTextField: FieldAPI;
  }
}

const Demo = () => {
  const styles = {
    textarea: css({
      marginBottom: tokens.spacingL,
      minHeight: '200px',
    }),
    copyButton: css({
      marginBottom: tokens.spacingM,
      'button, button:hover': {
        border: 'none',
        backgroundColor: 'transparent',
      },
    }),
    content: css({
      marginBottom: tokens.spacingL,
    }),
    contentHeader: css({
      marginBottom: '1rem',
    }),
    rawContent: css({
      overflowWrap: 'anywhere',
      fontFamily: 'monospace',
    }),
  };
  const [data, setData] = React.useState([]);
  const [copyButtonValue, setCopyButtonValue] = React.useState('');
  React.useEffect(() => {
    const value = data.reduce((acc, { type, data }) => ({ ...acc, [type]: data }), {});
    setCopyButtonValue(JSON.stringify(value));
  }, [data]);
  const handlePaste = React.useCallback((event) => {
    if (!event.clipboardData) {
      return setData([]);
    }

    const data = event.clipboardData.types.reduce(
      (acc, type) => [...acc, { type, data: event.clipboardData.getData(type) }],
      []
    );
    setData(data);
  }, []);

  return (
    <>
      <Heading>Paste your data from the clipboard</Heading>
      <Textarea onPaste={handlePaste} className={styles.textarea} />
      <Flex alignItems="center">
        <Subheading>Your pasted data </Subheading>
        <CopyButton
          className={styles.copyButton}
          size="small"
          value={copyButtonValue}
          isDisabled={data.length === 0}
        />
      </Flex>

      {data.map(({ type, data }) => (
        <Flex key={type} flexDirection="column" className={styles.content}>
          <SectionHeading className={styles.contentHeader}>{type}</SectionHeading>
          <Flex className={styles.rawContent}>{data}</Flex>
        </Flex>
      ))}
    </>
  );
};

export const Default: Story = {
  render: () => {
    return <Demo />;
  },
};
