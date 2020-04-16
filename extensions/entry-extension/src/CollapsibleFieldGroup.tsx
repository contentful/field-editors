import * as React from 'react';
import { LocalesAPI } from '@contentful/field-editor-shared';
import { Field } from './Field';
import { FieldGroupType, FieldKey } from './shared';
import { css } from 'emotion';
import { Icon } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';

interface CollapsibleFieldGroupProps {
  fieldGroup: FieldGroupType;
  fields: any; // wuh oh
  locales: LocalesAPI;
}

const styles = {
  heading: css({
    display: 'flex',
    justifyContent: 'space-between',
    margin: tokens.spacingL,
  }),
  button: css({
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '0',
  }),
  icon: css({
    backgroundColor: tokens.colorElementLight,
    borderRadius: '2px',
    padding: '3px',
    marginRight: '2px',
  }),

  fieldsContainer: css({
    backgroundColor: tokens.colorElementLight,
    padding: tokens.spacingL,
  }),
};

export const CollapsibleFieldGroup: React.FC<CollapsibleFieldGroupProps> = ({
  fieldGroup,
  fields,
  locales,
}: CollapsibleFieldGroupProps) => {
  const [isOpen, setOpen] = React.useState(false);
  const toggleOpen = () => setOpen(!isOpen);

  return (
    <div>
      <div className={styles.heading}>
        <button className={styles.button} onClick={toggleOpen}>
          <Icon className={styles.icon} icon={isOpen ? 'ChevronDown' : 'ChevronRight'} />
          <h3>{fieldGroup.name}</h3>
        </button>
        <p>{fieldGroup.fields.length} fields</p>
      </div>
      {isOpen ? (
        <div className={styles.fieldsContainer}>
          {fieldGroup.fields.map((k: FieldKey) => (
            <Field key={k} field={fields[k]} locales={locales} />
          ))}
        </div>
      ) : null}
    </div>
  );
};
