import * as React from 'react';
import identity from 'lodash/identity';
import { render, configure, cleanup, wait, fireEvent } from '@testing-library/react';
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

function createMocks(initialValues: { field?: string; titleField?: string } = {}) {
  const [field] = createFakeFieldAPI(
    field => ({
      ...field,
      id: 'slug-id',
      setValue: jest.fn().mockImplementation(field.setValue)
    }),
    initialValues.field || ''
  );
  const [titleField] = createFakeFieldAPI(
    field => ({
      ...field,
      id: 'title-id',
      setValue: jest.fn().mockImplementation(field.setValue),
      getValue: jest.fn().mockImplementation(field.getValue)
    }),
    initialValues.titleField || ''
  );

  const sdk = {
    locales: createFakeLocalesAPI(),
    space: {
      getEntries: jest.fn().mockResolvedValue({ total: 0 })
    },
    entry: {
      getSys: jest.fn().mockReturnValue({
        id: 'entry-id',
        publishedVersion: undefined,
        createdAt: '2020-01-24T15:33:47.906Z',
        contentType: {
          sys: {
            id: 'content-type-id'
          }
        }
      }),
      onSysChanged: jest.fn(),
      fields: {
        'title-id': titleField,
        'entry-id': field
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

describe('SlugEditor', () => {
  afterEach(cleanup);

  describe('should not subscribe to title changes', () => {
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

    it('when title and slug are the same field', async () => {
      const { field, sdk } = createMocks();

      sdk.contentType.displayField = 'entry-id';

      render(<SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />);

      await wait();

      expect(field.setValue).not.toHaveBeenCalled();
    });
  });

  describe('should check for uniqueness', () => {
    it('if it is published', async () => {
      const { field, sdk } = createMocks({
        titleField: 'Slug value',
        field: 'slug-value'
      });

      sdk.entry.getSys.mockReturnValue({
        id: 'entry-id',
        publishedVersion: 2,
        contentType: {
          sys: {
            id: 'content-type-id'
          }
        }
      });

      sdk.space.getEntries.mockResolvedValue({ total: 0 });

      const { queryByTestId, queryByText } = render(
        <SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />
      );

      await wait();

      expect(sdk.space.getEntries).toHaveBeenLastCalledWith({
        content_type: 'content-type-id',
        'fields.slug-id.en-US': 'slug-value',
        limit: 0,
        'sys.id[ne]': 'entry-id',
        'sys.publishedAt[exists]': true
      });
      expect(sdk.space.getEntries).toHaveBeenCalledTimes(1);
      expect(queryByTestId('slug-editor-spinner')).not.toBeInTheDocument();
      expect(
        queryByText('This slug has already been published in another entry')
      ).not.toBeInTheDocument();
    });

    it('if it is not published', async () => {
      const { field, sdk } = createMocks({
        titleField: 'Slug value',
        field: 'slug-value'
      });

      sdk.entry.getSys.mockReturnValue({
        id: 'entry-id',
        publishedVersion: undefined,
        contentType: {
          sys: {
            id: 'content-type-id'
          }
        }
      });

      sdk.space.getEntries.mockResolvedValue({ total: 2 });

      const { queryByTestId, queryByText, getByTestId } = render(
        <SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />
      );

      await wait();

      expect(sdk.space.getEntries).toHaveBeenLastCalledWith({
        content_type: 'content-type-id',
        'fields.slug-id.en-US': 'slug-value',
        limit: 0,
        'sys.id[ne]': 'entry-id',
        'sys.publishedAt[exists]': true
      });
      expect(sdk.space.getEntries).toHaveBeenCalledTimes(1);

      expect(queryByTestId('slug-editor-spinner')).not.toBeInTheDocument();
      expect(
        queryByText('This slug has already been published in another entry')
      ).toBeInTheDocument();

      expect(getByTestId('cf-ui-text-input')).toHaveValue('slug-value');

      sdk.space.getEntries.mockResolvedValue({ total: 0 });

      fireEvent.change(getByTestId('cf-ui-text-input'), { target: { value: '123' } });

      await wait();

      expect(field.setValue).toHaveBeenCalledTimes(1);
      expect(field.setValue).toHaveBeenCalledWith('123');
      expect(sdk.space.getEntries).toHaveBeenCalledTimes(2);
      expect(sdk.space.getEntries).toHaveBeenLastCalledWith({
        content_type: 'content-type-id',
        'fields.slug-id.en-US': '123',
        limit: 0,
        'sys.id[ne]': 'entry-id',
        'sys.publishedAt[exists]': true
      });

      expect(
        queryByText('This slug has already been published in another entry')
      ).not.toBeInTheDocument();
    });
  });

  describe('should react to title changes', () => {
    it('should generate unique value with date if title is empty', async () => {
      const { field, sdk } = createMocks({
        field: '',
        titleField: ''
      });

      render(<SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />);

      await wait();

      expect(field.setValue).toHaveBeenCalledTimes(1);
      expect(field.setValue).toHaveBeenLastCalledWith('untitled-entry-2020-01-24-at-15-33-47');

      sdk.entry.fields['title-id'].setValue('Hello world!');
      await wait();

      expect(field.setValue).toHaveBeenCalledTimes(2);
      expect(field.setValue).toHaveBeenLastCalledWith('hello-world');
      expect(sdk.space.getEntries).toHaveBeenCalledTimes(2);

      sdk.entry.fields['title-id'].setValue('фраза написанная по русски');
      await wait();

      expect(field.setValue).toHaveBeenCalledTimes(3);
      expect(field.setValue).toHaveBeenLastCalledWith('fraza-napisannaya-po-russki');
      expect(sdk.space.getEntries).toHaveBeenCalledTimes(3);
    });

    it('should generate value from title if it is not empty', async () => {
      const { field, sdk } = createMocks({
        field: '',
        titleField: 'This is initial title value'
      });

      render(<SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />);

      await wait();

      expect(field.setValue).toHaveBeenCalledTimes(1);
      expect(field.setValue).toHaveBeenLastCalledWith('this-is-initial-title-value');

      sdk.entry.fields['title-id'].setValue('Hello world!');
      await wait();

      expect(field.setValue).toHaveBeenCalledTimes(2);
      expect(field.setValue).toHaveBeenLastCalledWith('hello-world');
      expect(sdk.space.getEntries).toHaveBeenCalledTimes(2);
    });

    it('should stop tracking value after user intentionally changes slug value', async () => {
      const { field, sdk } = createMocks({
        field: '',
        titleField: ''
      });

      const { getByTestId } = render(
        <SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />
      );

      await wait();

      sdk.entry.fields['title-id'].setValue('Hello world!');
      await wait();

      expect(field.setValue).toHaveBeenCalledTimes(2);
      expect(field.setValue).toHaveBeenCalledWith('untitled-entry-2020-01-24-at-15-33-47');
      expect(field.setValue).toHaveBeenLastCalledWith('hello-world');
      expect(sdk.space.getEntries).toHaveBeenCalledTimes(2);

      fireEvent.change(getByTestId('cf-ui-text-input'), { target: { value: 'new-custom-slug' } });

      await wait();

      expect(field.setValue).toHaveBeenCalledTimes(3);
      expect(field.setValue).toHaveBeenLastCalledWith('new-custom-slug');

      sdk.entry.fields['title-id'].setValue('I decided to update my title');
      await wait();
      expect(field.setValue).toHaveBeenCalledTimes(3);

      sdk.entry.fields['title-id'].setValue('I decided to update my title again');
      await wait();
      expect(field.setValue).toHaveBeenCalledTimes(3);
    });
  });
});
