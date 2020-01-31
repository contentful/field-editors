import * as React from 'react';
import identity from 'lodash/identity';
import { render, configure, cleanup, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SlugEditor } from './SlugEditor';
import { createFakeFieldAPI, createFakeLocalesAPI } from '@contentful/field-editor-test-utils';

configure({
  testIdAttribute: 'data-test-id'
});

jest.mock(
  'lodash/throttle',
  () => ({
    default: identity
  }),
  { virtual: true }
);

describe('SlugEditor', () => {
  afterEach(cleanup);

  describe('should not subscribe to title changes', () => {
    function createMocks() {
      const [field] = createFakeFieldAPI(field => ({
        ...field,
        id: 'slug-id',
        setValue: jest.fn().mockImplementation(field.setValue)
      }));
      const [titleField] = createFakeFieldAPI(field => ({
        ...field,
        id: 'title-id',
        getValue: jest.fn().mockImplementation(field.getValue)
      }));

      const sdk = {
        locales: createFakeLocalesAPI(),
        space: {
          getEntries: jest.fn()
        },
        entry: {
          getSys: jest.fn().mockReturnValue({}),
          onSysChanged: jest.fn(),
          fields: {
            'title-id': titleField
          }
        },
        contentType: {
          displayField: 'title-id'
        }
      };

      return {
        field,
        titleField,
        sdk
      };
    }

    it('when field is disabled', async () => {
      const { field, sdk } = createMocks();

      sdk.entry.getSys.mockReturnValue({
        publishedVersion: undefined
      });

      render(<SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={true} />);

      await wait();

      expect(field.setValue).not.toHaveBeenCalled();
      expect(sdk.space.getEntries).not.toHaveBeenCalled();
      expect(sdk.entry.fields['title-id'].getValue).toHaveBeenCalledTimes(1);
      expect(sdk.entry.getSys).toHaveBeenCalledTimes(2);
    });

    it('when entry is published', async () => {
      const { field, sdk } = createMocks();

      sdk.entry.getSys.mockReturnValue({
        publishedVersion: 2
      });

      render(<SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />);

      await wait();

      expect(field.setValue).not.toHaveBeenCalled();
      expect(sdk.space.getEntries).not.toHaveBeenCalled();
      expect(sdk.entry.fields['title-id'].getValue).toHaveBeenCalledTimes(1);
      expect(sdk.entry.getSys).toHaveBeenCalledTimes(2);
    });
  });

  // it('calls field.setValue when user types and calls field.removeValue when user clears the input', () => {
  //   const [field] = createFakeFieldAPI(field => {
  //     jest.spyOn(field, 'setValue');
  //     jest.spyOn(field, 'removeValue');
  //     return {
  //       ...field,
  //       id: 'field-id',
  //       type: 'Symbol'
  //     };
  //   });

  //   const { getByTestId } = render(
  //     <SingleLineEditor
  //       field={field}
  //       isInitiallyDisabled={false}
  //       locales={createFakeLocalesAPI()}
  //     />
  //   );

  //   const $input = getByTestId('cf-ui-text-input');

  //   expect($input).toHaveValue('');

  //   fireEvent.change($input, {
  //     target: { value: 'new-value' }
  //   });

  //   expect($input).toHaveValue('new-value');
  //   expect(field.setValue).toHaveBeenCalledTimes(1);
  //   expect(field.setValue).toHaveBeenLastCalledWith('new-value');

  //   fireEvent.change($input, {
  //     target: { value: '' }
  //   });

  //   expect($input).toHaveValue('');
  //   expect(field.removeValue).toHaveBeenCalledTimes(1);
  //   expect(field.removeValue).toHaveBeenLastCalledWith();
  // });
});
