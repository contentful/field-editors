import * as React from 'react';
import { LocalesAPI } from '@contentful/field-editor-shared';
import { Field } from './Field';
import { FieldGroupType, FieldType } from './types';
import { css } from 'emotion';
import { Icon, HelpText } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { EntryFieldAPI } from 'contentful-ui-extensions-sdk';

interface CollapsibleFieldGroupProps {
  fieldGroup: FieldGroupType;
  fields: { [key: string]: EntryFieldAPI };
  locales: LocalesAPI;
}

const styles = {
  heading: css({
    display: 'flex',
    justifyContent: 'space-between',
    margin: tokens.spacingL
  }),

  button: css({
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '0'
  }),

  icon: css({
    backgroundColor: tokens.colorElementLightest,
    borderRadius: '2px',
    padding: '3px',
    marginRight: tokens.spacingXs
  }),

  fieldsContainer: css({
    backgroundColor: tokens.colorElementLightest,
    padding: tokens.spacingL
  })
};

export const CollapsibleFieldGroup: React.FC<CollapsibleFieldGroupProps> = ({
  fieldGroup,
  fields,
  locales
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
        <HelpText>{fieldGroup.fields.length} fields</HelpText>
      </div>
      {isOpen ? (
        <div className={styles.fieldsContainer}>
          {fieldGroup.fields.map((k: FieldType) => (
            <Field key={k.id} field={fields[k.id]} locales={locales} />
          ))}
        </div>
      ) : null}
    </div>
  );
};
