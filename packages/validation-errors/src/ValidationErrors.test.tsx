/* eslint-disable jest/expect-expect */
import * as React from 'react';

import '@testing-library/jest-dom/extend-expect';
import { ValidationError } from '@contentful/app-sdk';
import type { ContentType } from '@contentful/field-editor-shared';
import * as utils from '@contentful/field-editor-test-utils';
import { render, configure, cleanup, act } from '@testing-library/react';

import { ValidationErrors } from './ValidationErrors';

configure({
  testIdAttribute: 'data-test-id',
});

const displayField = 'my-title';
const contentTypeId = 'my-content-type';

const getCachedContentTypes = () =>
  [
    {
      displayField,
      fields: [
        {
          id: displayField,
        },
      ],
      sys: {
        id: 'my-content-type',
      },
    },
  ] as ContentType[];

const createEntry = (id: string) => ({
  fields: {
    [displayField]: {
      'en-US': 'entry-title-for-' + id,
    },
  },
  sys: {
    id,
    contentType: {
      sys: {
        id: contentTypeId,
      },
    },
  },
});

describe('ValidationErrors', () => {
  afterEach(cleanup);

  it('renders without crashing', () => {
    const [field] = utils.createFakeFieldAPI();

    const { container } = render(
      <ValidationErrors
        field={field}
        space={utils.createFakeSpaceAPI()}
        locales={utils.createFakeLocalesAPI()}
        getEntryURL={(entry) => `url.${entry.sys.id}`}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render the list of error messages', async () => {
    const errors: ValidationError[] = [
      {
        name: 'test-error',
        message: 'The input is invalid',
        path: [],
      },
    ];

    const [field, emitter] = utils.createFakeFieldAPI();

    const { findByText } = render(
      <ValidationErrors
        field={field}
        space={utils.createFakeSpaceAPI()}
        locales={utils.createFakeLocalesAPI()}
        getEntryURL={(entry) => `url.${entry.sys.id}`}
      />
    );

    act(() => {
      emitter.emit('onSchemaErrorsChanged', errors);
    });

    await Promise.all(
      errors.map((e) => {
        if (e.message) {
          return findByText(e.message);
        } else {
          return Promise.reject();
        }
      })
    );
  });

  it('should fetch & render links to duplicated entries', async () => {
    const ids = ['id-0', 'id-1', 'id-2'];
    const errors: ValidationError[] = [
      {
        name: 'unique',
        message: 'entry is duplicated',
        conflicting: ids.map((id) => ({ sys: { id, type: 'Link', linkType: 'Entry' } })),
        path: [],
      },
    ];

    const [field, emitter] = utils.createFakeFieldAPI();

    const space = utils.createFakeSpaceAPI((api) => ({
      ...api,
      getCachedContentTypes,
      getEntries: jest.fn().mockResolvedValue({
        items: ids.map(createEntry),
      }),
    }));

    const { findByText, findAllByTestId } = render(
      <ValidationErrors
        field={field}
        space={space}
        locales={utils.createFakeLocalesAPI()}
        getEntryURL={(entry) => `url.${entry.sys.id}`}
      />
    );

    act(() => {
      emitter.emit('onSchemaErrorsChanged', errors);
    });

    await findByText(/Loading title for conflicting entry/);

    const links = await findAllByTestId('cf-ui-text-link');

    links.forEach((link, index) => {
      expect(link).toHaveAttribute('href', 'url.id-' + index);
      expect(link).toHaveTextContent('entry-title-for-id-' + index);
    });
  });
});
