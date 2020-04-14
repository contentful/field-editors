import * as React from 'react';
import { render } from 'react-dom';
import {
  DisplayText,
  Paragraph,
  SectionHeading,
  Form
} from '@contentful/forma-36-react-components';
import { init, locations, EditorExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';

interface AppProps {
  sdk: EditorExtensionSDK;
}

export class App extends React.Component<AppProps> {
  render() {
    return (
      <Form className="f36-margin--l">
        <DisplayText testId="title">Entry extension demo</DisplayText>
        <Paragraph>
          This demo uses a single UI Extension to render the whole editor for an entry.
        </Paragraph>
        <SectionHeading>Title</SectionHeading>
        <SectionHeading>Body</SectionHeading>
      </Form>
    );
  }
}

init(sdk => {
  if (sdk.location.is(locations.LOCATION_ENTRY_EDITOR)) {
    render(<App sdk={sdk as EditorExtensionSDK} />, document.getElementById('root'));
  }
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
