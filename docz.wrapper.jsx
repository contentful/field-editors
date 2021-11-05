import * as React from 'react';
import { GlobalStyles } from '@contentful/f36-components';

export default function Wrapper({ children }) {
  return React.createElement(React.Fragment, {}, React.createElement(GlobalStyles, {}), children);
}
