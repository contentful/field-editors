import * as React from 'react';
import { render } from 'react-dom';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import { SingleLineEditor } from '../../../packages/single-line/src';
import { Paragraph, TextLink } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { css } from 'emotion';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

interface AppProps {
  sdk: FieldExtensionSDK;
}

const App: React.FC<AppProps> = (props: AppProps) => {
  const [possibleTitle, setPossibleTitle] = React.useState('');

  React.useEffect(() => {
    async function fetchData() {
      const result = await fetch('https://jsonplaceholder.typicode.com/todos');

      const json = await result.json();
      setPossibleTitle(json[Math.floor(Math.random() * json.length)].title);
    }
    fetchData();
  }, []);

  return (
    <div>
      <div className={css({ marginBottom: tokens.spacingM, marginTop: tokens.spacingS })}>
        <Paragraph>{possibleTitle === '' ? 'loading' : `How about "${possibleTitle}"?`}</Paragraph>
        <TextLink
          className={css({ marginRight: tokens.spacingS })}
          onClick={() => props.sdk.field.setValue(possibleTitle)}>
          Okay
        </TextLink>
        <TextLink onClick={() => props.sdk.field.setValue('')}>Clear the field</TextLink>
      </div>

      <SingleLineEditor field={props.sdk.field} locales={props.sdk.locales} />
    </div>
  );
};

init((sdk: FieldExtensionSDK) => {
  sdk.window.startAutoResizer();
  render(<App sdk={sdk as FieldExtensionSDK} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
