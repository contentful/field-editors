import * as React from 'react';
import { render } from 'react-dom';
import { DisplayText, Form } from '@contentful/forma-36-react-components';
import { init, locations, EditorExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';
import { SingleLineEditor } from '../../../packages/single-line/src/index';
import { NumberEditor } from '../../../packages/number/src/index';
import { EntryFieldAPI, LocalesAPI } from '@contentful/field-editor-shared';

interface AppProps {
  sdk: EditorExtensionSDK;
}
const Fieldo = ({ field, locales }: { field: EntryFieldAPI; locales: LocalesAPI }) => {
  switch (field.type) {
    case 'Symbol':
      return <SingleLineEditor field={field} locales={locales} />;
    case 'Integer':
      return <NumberEditor field={field} />;
  }
  console.log(field);
  return (
    <div>
      field {field.id} of type {field.type} was not implemented yet
    </div>
  );
};

export class App extends React.Component<AppProps> {
  render() {
    const { fields } = this.props.sdk.entry;
    console.log(this.props.sdk);
    return (
      <Form className="f36-margin--l">
        <DisplayText testId="title">Entry extension demo</DisplayText>
        {Object.keys(fields).map(k => (
          <Fieldo key={k} field={fields[k]} locales={this.props.sdk.locales} />
        ))}
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
