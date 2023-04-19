import React from 'react';

import { WrappedAssetCard } from '../../../packages/reference/src';
import { WrappedAssetCardProps } from '../../../packages/reference/src/assets/WrappedAssetCard/WrappedAssetCard';
import { fixtures } from '../../fixtures';
import { mount } from '../mount';

const props: WrappedAssetCardProps = {
  size: 'default',
  renderDragHandle: undefined,
  onRemove: () => null,
  localeCode: 'en-US',
  isDisabled: false,
  defaultLocaleCode: 'en-US',
  entityUrl: undefined,
  getAssetUrl: undefined,
  getEntityScheduledActions: () => Promise.resolve([]),
  // @ts-expect-error -- fix types from asset
  asset: fixtures.assets.published,
};

describe('Wrapped Asset Card', () => {
  it('also fires onEdit event when pressing enter on the keyboard', () => {
    const onEdit = cy.stub().as('on-edit');
    mount(<WrappedAssetCard {...props} isClickable={true} onEdit={onEdit} />);
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy.findByTestId('cf-ui-asset-card').focus().type('{enter}');
    cy.get('@on-edit').should('have.been.called');
  });
});
