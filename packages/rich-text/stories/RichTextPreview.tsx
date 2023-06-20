import React from 'react';

import { Highlight, themes } from 'prism-react-renderer';

type Props = {
  value: string;
};

export const RichTextPreview = ({ value = '{}' }: Props) => {
  return (
    <Highlight theme={themes.vsDark} code={value} language="js">
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre
          style={{
            ...style,
            marginTop: 0,
            height: '100%',
            borderRadius: '4px',
            padding: '4px',
            overflowX: 'scroll',
          }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};
