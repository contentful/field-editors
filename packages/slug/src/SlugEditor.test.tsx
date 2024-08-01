import * as React from 'react';

import { createFakeFieldAPI, createFakeLocalesAPI } from '@contentful/field-editor-test-utils';
import { cleanup, configure, fireEvent, render, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';
import { SlugEditor } from './SlugEditor';

configure({
  testIdAttribute: 'data-test-id',
});

vi.mock('use-debounce', () => ({
  useDebounce: (text: string) => [text],
}));

function createMocks(
  initialValues: { field?: string; titleField?: string; descriptionField?: string } = {}
) {
  const [field] = createFakeFieldAPI(
    (field) => ({
      ...field,
      id: 'slug-id',
      onValueChanged: vi.fn().mockImplementation(field.onValueChanged),
      setValue: vi.fn().mockImplementation(field.setValue),
    }),
    initialValues.field || ''
  );

  const [titleField] = createFakeFieldAPI(
    (field) => ({
      ...field,
      id: 'title-id',
      setValue: vi.fn().mockImplementation(field.setValue),
      getValue: vi.fn().mockImplementation(field.getValue),
      onValueChanged: vi.fn().mockImplementation(field.onValueChanged),
    }),
    initialValues.titleField || ''
  );

  const [descriptionField] = createFakeFieldAPI(
    (field) => ({
      ...field,
      id: 'description-id',
      setValue: vi.fn().mockImplementation(field.setValue),
      getValue: vi.fn().mockImplementation(field.getValue),
      onValueChanged: vi.fn().mockImplementation(field.onValueChanged),
    }),
    initialValues.descriptionField || ''
  );

  const sdk = {
    locales: createFakeLocalesAPI(),
    space: {
      getEntries: vi.fn().mockResolvedValue({ total: 0 }),
    },
    entry: {
      getSys: vi.fn().mockReturnValue({
        id: 'entry-id',
        publishedVersion: undefined,
        createdAt: '2020-01-24T15:33:47.906Z',
        contentType: {
          sys: {
            id: 'content-type-id',
          },
        },
      }),
      onSysChanged: vi.fn(),
      fields: {
        'title-id': titleField,
        'entry-id': field,
        'description-id': descriptionField,
      },
    },
    contentType: {
      displayField: 'title-id',
    },
  };

  return {
    field,
    titleField,
    descriptionField,
    sdk,
  };
}

describe('SlugEditor', () => {
  afterEach(cleanup);

  describe('should not subscribe to title changes', () => {
    it('when entry is published', async () => {
      const { field, titleField, sdk } = createMocks();

      sdk.entry.getSys.mockReturnValue({
        publishedVersion: 2,
      });

      render(<SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />);

      await waitFor(() => {
        expect(field.setValue).not.toHaveBeenCalled();
        expect(titleField.onValueChanged).toHaveBeenCalledWith('en-US', expect.any(Function));
        expect(sdk.space.getEntries).not.toHaveBeenCalled();
        expect(sdk.entry.fields['title-id'].getValue).toHaveBeenCalledTimes(1);
        expect(sdk.entry.getSys).toHaveBeenCalledTimes(2);
      });
    });

    it('when title and slug are the same field', async () => {
      const { field, titleField, sdk } = createMocks();

      sdk.contentType.displayField = 'entry-id';

      render(<SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />);

      await waitFor(() => {
        expect(titleField.onValueChanged).not.toHaveBeenCalled();
        expect(field.setValue).not.toHaveBeenCalled();
      });
    });

    it('when a saved slug is different from a title at the render', async () => {
      const { field, titleField, sdk } = createMocks({
        titleField: 'Hello world!',
        field: 'something-different',
      });

      render(<SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />);

      await waitFor(() => {
        expect(titleField.onValueChanged).toHaveBeenCalledWith('en-US', expect.any(Function));
        expect(field.setValue).not.toHaveBeenCalled();
      });
    });
  });

  describe('should check for uniqueness', () => {
    it('if it is published', async () => {
      const { field, titleField, sdk } = createMocks({
        titleField: 'Slug value',
        field: 'slug-value',
      });

      sdk.entry.getSys.mockReturnValue({
        id: 'entry-id',
        publishedVersion: 2,
        contentType: {
          sys: {
            id: 'content-type-id',
          },
        },
      });

      sdk.space.getEntries.mockResolvedValue({ total: 0 });

      const { queryByTestId, queryByText } = render(
        <SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />
      );

      await waitFor(() => {
        expect(titleField.onValueChanged).toHaveBeenCalledWith('en-US', expect.any(Function));
        expect(sdk.space.getEntries).toHaveBeenLastCalledWith({
          content_type: 'content-type-id',
          'fields.slug-id.en-US': 'slug-value',
          limit: 0,
          'sys.id[ne]': 'entry-id',
          'sys.publishedAt[exists]': true,
        });
        expect(sdk.space.getEntries).toHaveBeenCalledTimes(1);
        expect(queryByTestId('slug-editor-spinner')).not.toBeInTheDocument();
        expect(
          queryByText('This slug has already been published in another entry')
        ).not.toBeInTheDocument();
      });
    });

    it('if it is not published', async () => {
      const { field, titleField, sdk } = createMocks({
        titleField: 'Slug value',
        field: 'slug-value',
      });

      sdk.entry.getSys.mockReturnValue({
        id: 'entry-id',
        publishedVersion: undefined,
        contentType: {
          sys: {
            id: 'content-type-id',
          },
        },
      });

      sdk.space.getEntries.mockResolvedValue({ total: 2 });

      const { queryByTestId, queryByText, getByTestId } = render(
        <SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />
      );

      await waitFor(() => {
        expect(titleField.onValueChanged).toHaveBeenCalledWith('en-US', expect.any(Function));
        expect(sdk.space.getEntries).toHaveBeenLastCalledWith({
          content_type: 'content-type-id',
          'fields.slug-id.en-US': 'slug-value',
          limit: 0,
          'sys.id[ne]': 'entry-id',
          'sys.publishedAt[exists]': true,
        });
        expect(sdk.space.getEntries).toHaveBeenCalledTimes(1);

        expect(queryByTestId('slug-editor-spinner')).not.toBeInTheDocument();
        expect(
          queryByText('This slug has already been published in another entry')
        ).toBeInTheDocument();

        expect(getByTestId('cf-ui-text-input')).toHaveValue('slug-value');
      });

      sdk.space.getEntries.mockResolvedValue({ total: 0 });

      fireEvent.change(getByTestId('cf-ui-text-input'), { target: { value: '123' } });

      await waitFor(() => {
        expect(field.setValue).toHaveBeenCalledTimes(1);
        expect(field.setValue).toHaveBeenCalledWith('123');
        expect(sdk.space.getEntries).toHaveBeenCalledTimes(2);
        expect(sdk.space.getEntries).toHaveBeenLastCalledWith({
          content_type: 'content-type-id',
          'fields.slug-id.en-US': '123',
          limit: 0,
          'sys.id[ne]': 'entry-id',
          'sys.publishedAt[exists]': true,
        });

        expect(
          queryByText('This slug has already been published in another entry')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('should react to title changes', () => {
    it('when field is disabled', async () => {
      const { field, titleField, sdk } = createMocks({
        field: '',
        titleField: '',
      });

      render(<SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={true} />);

      await waitFor(() => {
        expect(field.setValue).toHaveBeenCalled();
        expect(titleField.onValueChanged).toHaveBeenCalledWith('en-US', expect.any(Function));
        expect(sdk.space.getEntries).toHaveBeenCalled();
        expect(sdk.entry.fields['title-id'].getValue).toHaveBeenCalledTimes(1);
        expect(sdk.entry.getSys).toHaveBeenCalledTimes(2);
      });
    });

    it('should generate unique value with date if title is empty', async () => {
      const { field, titleField, sdk } = createMocks({
        field: '',
        titleField: '',
      });

      render(<SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />);

      await waitFor(() => {
        expect(titleField.onValueChanged).toHaveBeenCalledWith('en-US', expect.any(Function));
        expect(field.setValue).toHaveBeenCalledTimes(1);
        expect(field.setValue).toHaveBeenLastCalledWith('untitled-entry-2020-01-24-at-15-33-47');
      });

      await sdk.entry.fields['title-id'].setValue('Hello world!');
      await waitFor(() => {
        expect(field.setValue).toHaveBeenCalledTimes(2);
        expect(field.setValue).toHaveBeenLastCalledWith('hello-world');
        expect(sdk.space.getEntries).toHaveBeenCalledTimes(2);
      });

      await sdk.entry.fields['title-id'].setValue('фраза написанная по русски');
      await waitFor(() => {
        expect(field.setValue).toHaveBeenCalledTimes(3);
        expect(field.setValue).toHaveBeenLastCalledWith('fraza-napisannaya-po-russki');
        expect(sdk.space.getEntries).toHaveBeenCalledTimes(3);
      });
    });

    it('should generate value from title if it is not empty', async () => {
      const { field, titleField, sdk } = createMocks({
        field: '',
        titleField: 'This is initial title value',
      });

      render(<SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />);

      await waitFor(() => {
        expect(titleField.onValueChanged).toHaveBeenCalledWith('en-US', expect.any(Function));
        expect(field.setValue).toHaveBeenCalledTimes(1);
        expect(field.setValue).toHaveBeenLastCalledWith('this-is-initial-title-value');
      });

      await sdk.entry.fields['title-id'].setValue('Hello world!');
      await waitFor(() => {
        expect(field.setValue).toHaveBeenCalledTimes(2);
        expect(field.setValue).toHaveBeenLastCalledWith('hello-world');
        expect(sdk.space.getEntries).toHaveBeenCalledTimes(2);
      });
    });

    it('should stop tracking value after user intentionally changes slug value', async () => {
      const { field, titleField, sdk } = createMocks({
        field: '',
        titleField: '',
      });

      const { getByTestId } = render(
        <SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />
      );

      await waitFor(async () => {
        await sdk.entry.fields['title-id'].setValue('Hello world!');
      });

      await waitFor(() => {
        expect(titleField.onValueChanged).toHaveBeenCalledWith('en-US', expect.any(Function));
        expect(field.setValue).toHaveBeenCalledTimes(2);
        expect(field.setValue).toHaveBeenCalledWith('untitled-entry-2020-01-24-at-15-33-47');
        expect(field.setValue).toHaveBeenLastCalledWith('hello-world');
        expect(sdk.space.getEntries).toHaveBeenCalledTimes(2);
      });

      fireEvent.change(getByTestId('cf-ui-text-input'), { target: { value: 'new-custom-slug' } });

      await waitFor(() => {
        expect(field.setValue).toHaveBeenCalledTimes(3);
        expect(field.setValue).toHaveBeenLastCalledWith('new-custom-slug');
      });

      await sdk.entry.fields['title-id'].setValue('I decided to update my title');
      await waitFor(() => {
        expect(field.setValue).toHaveBeenCalledTimes(3);
      });

      await sdk.entry.fields['title-id'].setValue('I decided to update my title again');
      await waitFor(() => {
        expect(field.setValue).toHaveBeenCalledTimes(3);
      });
    });

    it('should start tracking again after potential slug equals real one', async () => {
      const { field, sdk } = createMocks({
        field: '',
        titleField: '',
      });

      const { getByTestId } = render(
        <SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />
      );

      await waitFor(async () => {
        await sdk.entry.fields['title-id'].setValue('ABC DEF');
      });

      /*
        Type title "ABC DEF"
          -> Slug changes to "abc-def"
      */

      await waitFor(() => {
        expect(field.setValue).toHaveBeenLastCalledWith('abc-def');
        expect(field.setValue).toHaveBeenCalledTimes(2);
      });

      /*
        Change slug to custom one "abc"
      */
      fireEvent.change(getByTestId('cf-ui-text-input'), { target: { value: 'abc' } });

      /*
        Change title to "ABC D"
        -> Slug does not change
      */
      await sdk.entry.fields['title-id'].setValue('ABC D');
      await waitFor(() => {
        expect(field.setValue).toHaveBeenLastCalledWith('abc');
        expect(field.setValue).toHaveBeenCalledTimes(3);
      });

      /*
      Change title to "ABC" first and change title to "ABC ABC"
        -> Slug should change to "abc-abc" as it should have started tracking again
      */
      await waitFor(async () => {
        await sdk.entry.fields['title-id'].setValue('ABC');
        await sdk.entry.fields['title-id'].setValue('ABC ABC');
      });

      await waitFor(() => {
        expect(field.setValue).toHaveBeenLastCalledWith('abc-abc');
        expect(field.setValue).toHaveBeenCalledTimes(4);
      });
    });
  });

  describe('for non default locales', () => {
    it('locale is not optional and has no fallback then it should track default locale changes & current locale changes', async () => {
      const { sdk, field, titleField } = createMocks();

      field.locale = 'ru-RU';
      field.required = false;
      sdk.locales.available = ['de-DE', 'ru-RU'];
      sdk.locales.default = 'de-DE';
      sdk.locales.optional = {
        'de-DE': false,
        'ru-RU': false,
      };
      sdk.locales.fallbacks = {
        'de-DE': undefined,
        'ru-RU': undefined,
      };

      render(<SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />);

      await waitFor(() => {
        expect(field.setValue).toHaveBeenCalledWith('untitled-entry-2020-01-24-at-15-33-47');
        expect(titleField.onValueChanged).toHaveBeenCalledWith('ru-RU', expect.any(Function));
        expect(titleField.onValueChanged).toHaveBeenCalledWith('de-DE', expect.any(Function));
      });
    });

    it('locale is optional and has a fallback then it should track only current locale changes', async () => {
      const { sdk, field, titleField } = createMocks();

      field.locale = 'ru-RU';
      field.required = false;
      sdk.locales.available = ['de-DE', 'ru-RU'];
      sdk.locales.default = 'de-DE';
      sdk.locales.optional = {
        'de-DE': false,
        'ru-RU': true,
      };
      sdk.locales.fallbacks = {
        'de-DE': undefined,
        'ru-RU': 'de-DE',
      };

      render(<SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />);

      await waitFor(() => {
        expect(field.setValue).not.toHaveBeenCalled();
        expect(titleField.onValueChanged).toHaveBeenCalledWith('ru-RU', expect.any(Function));
        expect(titleField.onValueChanged).not.toHaveBeenCalledWith('de-DE', expect.any(Function));
      });
    });
  });

  it('slug suggestion is limited to 75 symbols', async () => {
    const { field, sdk } = createMocks({
      field: '',
      titleField: '',
    });

    render(<SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />);

    await waitFor(async () => {
      await sdk.entry.fields['title-id'].setValue('a'.repeat(80));
    });

    await waitFor(() => {
      const expectedSlug = 'a'.repeat(75);
      expect(field.setValue).toHaveBeenLastCalledWith(expectedSlug);
    });
  });

  it('slug suggestion does not contain cut-off words', async () => {
    const { field, sdk } = createMocks({
      field: '',
      titleField: '',
    });

    render(<SlugEditor field={field} baseSdk={sdk as any} isInitiallyDisabled={false} />);

    await waitFor(async () => {
      await sdk.entry.fields['title-id'].setValue(`one two three ${'a'.repeat(80)}`);
    });

    await waitFor(() => {
      const expectedSlug = 'one-two-three';
      expect(field.setValue).toHaveBeenLastCalledWith(expectedSlug);
    });
  });

  it('should subscribe for changes in custom field id', async () => {
    const { field, titleField, descriptionField, sdk } = createMocks({
      field: '',
      titleField: 'This is initial title value',
      descriptionField: 'This is initial description value',
    });

    render(
      <SlugEditor
        field={field}
        baseSdk={sdk as any}
        isInitiallyDisabled={false}
        parameters={{ instance: { trackingFieldId: 'description-id' } }}
      />
    );

    await waitFor(() => {
      expect(titleField.onValueChanged).not.toHaveBeenCalled();
      expect(descriptionField.onValueChanged).toHaveBeenCalledWith('en-US', expect.any(Function));
      expect(field.setValue).toHaveBeenCalledTimes(1);
      expect(field.setValue).toHaveBeenLastCalledWith('this-is-initial-description-value');
    });

    await sdk.entry.fields['description-id'].setValue('Hello world!');
    await waitFor(() => {
      expect(field.setValue).toHaveBeenCalledTimes(2);
      expect(field.setValue).toHaveBeenLastCalledWith('hello-world');
      expect(sdk.space.getEntries).toHaveBeenCalledTimes(2);
    });
  });
});
