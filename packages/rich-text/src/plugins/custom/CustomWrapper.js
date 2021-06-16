import React from 'react';
import { TextAlignCenter, TextAlignRight } from './TextAlign';
import { SmallText } from './SmallText';
import { EditorToolbarDivider } from '@contentful/forma-36-react-components';

export default (props) => {
  return (
    <>
      {<EditorToolbarDivider testId="custom-divider" />}
      <SmallText {...props} />
      <TextAlignCenter {...props} />
      <TextAlignRight {...props} />
    </>
  );
};
