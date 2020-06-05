import React from 'react';
import Enzyme from 'enzyme';

import { ConnectedRichTextEditor as RichTextEditor } from './RichTextEditor';
import Toolbar from './Toolbar';

jest.mock('ng/data/CMA/EntityState', () => ({}), { virtual: true });
jest.mock('directives/thumbnailHelpers', () => ({}), { virtual: true });
jest.mock('access_control/AccessChecker', () => ({}), { virtual: true });
jest.mock('utils/browser', () => ({}), { virtual: true });
jest.mock('redux/store', () => ({}), { virtual: true });
jest.mock('ng/entityCreator', () => ({}), { virtual: true });
jest.mock('ng/debounce', () => jest.fn(), { virtual: true });

const fakeProps = (props) => ({
  sdk: {
    field: {
      id: 'FIELD_ID,',
      locale: 'FIELD_LOCALE',
    },
    access: {
      can: async (access, entityType) => {
        if (entityType === 'Asset') {
          if (access === 'create') {
            return true;
          }
          if (access === 'read') {
            return true;
          }
        }
        return false;
      },
    },
  },
  navigator: {
    onSlideInNavigation: () => () => {
      return;
    },
  },
  value: undefined,
  onChange: jest.fn(),
  onAction: jest.fn(),
  isDisabled: false,
  showToolbar: false,
  ...props,
});

describe('RichTextEditor', () => {
  it('renders the editor', function () {
    const wrapper = Enzyme.shallow(<RichTextEditor {...fakeProps()} />);

    expect(wrapper.find('[data-test-id="editor"]').props().readOnly).toBe(false);
  });

  it('renders toolbar', function () {
    const wrapper = Enzyme.shallow(<RichTextEditor {...fakeProps()} />);

    expect(wrapper.find(Toolbar)).toHaveLength(1);
  });

  it('renders readonly editor and toolbar', function () {
    const wrapper = Enzyme.shallow(<RichTextEditor {...fakeProps({ isDisabled: true })} />);

    expect(wrapper.find('[data-test-id="editor"]').props().readOnly).toBe(true);
    expect(wrapper.find(Toolbar).props().isDisabled).toBe(true);
  });
});
