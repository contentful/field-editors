import * as React from 'react';
import { LocalesAPI } from '@contentful/field-editor-shared';
import { Field } from './Field';
import { FieldGroup, FieldKey } from './shared';

interface CollapsibleFieldGroupProps {
  fieldGroup: FieldGroup;
  fields: any; // wuh oh
  locales: LocalesAPI;
}

export const CollapsibleFieldGroup: React.FC<CollapsibleFieldGroupProps> = ({
  fieldGroup,
  fields,
  locales
}: CollapsibleFieldGroupProps) => {
  const [isOpen, setOpen] = React.useState(false);
  return (
    <React.Fragment>
      <div>
        <button onClick={() => setOpen(!isOpen)}>
          <p>{isOpen ? 'close' : 'open'}</p>
          <h3>{fieldGroup.name}</h3>
        </button>
        <p>{fieldGroup.fields.length} fields</p>
      </div>
      {isOpen
        ? fieldGroup.fields.map((k: FieldKey) => (
            <Field key={k} field={fields[k]} locales={locales} />
          ))
        : null}
    </React.Fragment>
  );
};
