import * as React from 'react';

import { createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import { act, render } from '@testing-library/react';
import noop from 'lodash/noop';

import { FieldConnector, FieldConnectorChildProps } from './FieldConnector';

function getChild(children: any): FieldConnectorChildProps<any> {
  return children.mock.calls[children.mock.calls.length - 1][0];
}

it('does not rerender with outdated value after calling setValue', async () => {
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
    debounce: 0,
  };

  render(<FieldConnector {...props} />);

  let child = getChild(props.children);
  expect(child.value).toBe('initial value');
  const initialRenderCount = props.children.mock.calls.length;

  await act(async () => {
    child.setValue('new value');
  });

  onSchemaErrorsChanged.mock.calls.forEach(([cb]) => cb([]));

  child = getChild(props.children);
  expect(child.value).toBe('new value');

  // to ensure that there was actually a rerender after calling `setValue` as we want to test that we don't rerender with outdated data
  expect(props.children.mock.calls.length).toBeGreaterThan(initialRenderCount);
});

it('takes initial disable state from sdk.field', () => {
  const [field] = createFakeFieldAPI((field: any) => {
    return {
      ...field,
      // this promise never resolves
      getIsDisabled: jest.fn().mockReturnValue(true),
    };
  }, 'initial value');

  const props = {
    isInitiallyDisabled: false,
    children: jest.fn().mockImplementation(() => null),
    field,
    debounce: 0,
  };

  render(<FieldConnector {...props} />);

  const child = getChild(props.children);
  expect(child.value).toBe('initial value');

  expect(field.getIsDisabled).toHaveBeenCalled();

  expect(props.children).toHaveBeenCalledTimes(1);
  expect(props.children).toHaveBeenCalledWith(
    expect.objectContaining({
      disabled: true,
    })
  );
});
