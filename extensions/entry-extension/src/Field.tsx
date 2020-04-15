import * as React from 'react';
import { SingleLineEditor } from '../../../packages/single-line/src/index';
import { NumberEditor } from '../../../packages/number/src/index';
import { LocalesAPI } from '@contentful/field-editor-shared';

export const Field = ({ field, locales }: { field: any; locales: LocalesAPI }) => {
  field.onSchemaErrorsChanged = () => {};
  field.locale = 'en-US';
  locales.direction = {};
  locales.direction['en-US'] = 'ltr';
  switch (field.type) {
    case 'Symbol':
      return <SingleLineEditor field={field} locales={locales} />;
    case 'Integer':
      return <NumberEditor field={field} />;
  }

  return (
    <div>
      field {field.id} of type {field.type} was not implemented yet
    </div>
  );
};
