import * as React from 'react';

import { createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import { render } from '@testing-library/react';
import noop from 'lodash/noop';

import { FieldConnector, FieldConnectorChildProps } from './FieldConnector';

it('does not rerender with outdated value after calling setValue', () => {
  function getChild(): FieldConnectorChildProps<any> {
    return props.children.mock.calls[props.children.mock.calls.length - 1][0];
  }

  const onSchemaErrorsChanged = jest.fn();
  const [field] = createFakeFieldAPI((field: any) => {
    return {
      ...field,
      // this promise never resolves
      setValue: () => new Promise(noop),
      onSchemaErrorsChanged,
    };
  }, 'initial value');

  const props = {
    isInitiallyDisabled: false,
    children: jest.fn().mockImplementation(() => null),
    field,
    throttle: 0,
  };

  render(<FieldConnector {...props} />);

  let child = getChild();
  expect(child.value).toBe('initial value');
  const initialRenderCount = props.children.mock.calls.length;

  child.setValue('new value');

  onSchemaErrorsChanged.mock.calls.forEach(([cb]) => cb([]));

  child = getChild();
  expect(child.value).toBe('new value');

  // to ensure that there was actually a rerender after calling `setValue` as we want to test that we don't rerender with outdated data
  expect(props.children.mock.calls.length).toBeGreaterThan(initialRenderCount);
});
