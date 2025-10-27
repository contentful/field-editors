import * as React from 'react';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { RichTextEditor } from '@contentful/field-editor-rich-text';

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();

  React.useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk]);

  return <RichTextEditor sdk={sdk} isInitiallyDisabled />;
};

export default Field;
