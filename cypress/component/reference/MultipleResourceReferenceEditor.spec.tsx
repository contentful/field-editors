import React from 'react';

import { Card, Heading, Paragraph, Button } from '@contentful/f36-components';
import { Entry } from '@contentful/field-editor-shared';

import { MultipleResourceReferenceEditor } from '../../../packages/reference/src';
import { mount } from '../mount';
import { createReferenceEditorTestSdk, fixtures } from '../test-sdks';
import { Entity, Link } from '../../../packages/reference/src/types';

function asLink<E extends Entity>(entity: E): Link {
  return {
    sys: {
      type: 'ResourceLink',
      linkType: 'Contentful:Entry',
      // @ts-expect-error
      urn: 'crn:flinkly:::content:spaces/m1w65xdr8d13',
    },
  };
}

const commonProps = {
  isInitiallyDisabled: false,
  hasCardEditActions: false,
  viewType: 'link',
  parameters: {
    instance: {
      showCreateEntityAction: undefined,
      showLinkEntityAction: undefined,
      bulkEditing: undefined,
    },
  },
  apiUrl: '',
  getEntryRouteHref: () => '',
};

describe('Multiple resource editor', () => {
  const findLinkExistingBtn = () => cy.findByTestId('linkEditor.linkExisting');
  // const findCreateLinkBtn = () => cy.findByTestId('create-entry-link-button');
  const findCustomCards = () => cy.findAllByTestId('custom-card');
  const findDefaultCards = () => cy.findAllByTestId('cf-ui-entry-card');

  it('is empty by default', () => {
    const sdk = createReferenceEditorTestSdk();
    mount(<MultipleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />);

    findCustomCards().should('not.exist');
    findLinkExistingBtn().should('be.enabled');
  });

  it.only('renders custom cards', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entry.changed)],
    });
    mount(
      <MultipleResourceReferenceEditor
        {...commonProps}
        viewType="card"
        // renderCustomCard={(props) => {
        //   const entity = props.entity as Entry;
        //   const { exField, exDesc } = entity.fields;

        //   if (!exField) {
        //     return false;
        //   }

        //   return (
        //     <Card testId="custom-card">
        //       <Heading>{exField.en}</Heading>
        //       <Paragraph>{exDesc.en}</Paragraph>
        //       <Button onClick={props.onEdit} style={{ marginRight: '10px' }}>
        //         Edit
        //       </Button>
        //       <Button onClick={props.onRemove}>Remove</Button>
        //     </Card>
        //   );
        // }}
        sdk={sdk}
      />
    );

    // findLinkExistingBtn().click();
    // findCustomCards().should('have.length', 2);
  });
});
