import * as React from 'react';
import { LocalesAPI } from '@contentful/field-editor-shared';
import { Field } from './Field';
import { FieldGroupType, FieldType } from './types';
import styles from './styles';
import { Icon, HelpText } from '@contentful/forma-36-react-components';
import { EntryFieldAPI } from '@contentful/app-sdk';

interface CollapsibleFieldGroupProps {
  fieldGroup: FieldGroupType;
  fields: { [key: string]: EntryFieldAPI };
  locales: LocalesAPI;
}

export const CollapsibleFieldGroup: React.FC<CollapsibleFieldGroupProps> = ({
  fieldGroup,
  fields,
  locales,
}: CollapsibleFieldGroupProps) => {
  const [isOpen, setOpen] = React.useState(false);
  const toggleOpen = () => setOpen(!isOpen);

  return (
    <div>
      <div className={styles.widthContainer}>
        <div className={styles.collapsibleContainerHeader}>
          <button className={styles.collapsibleContainerButton} onClick={toggleOpen}>
            <div className={styles.collapsibleContainerInfo}>
              <Icon className={styles.icon} icon={isOpen ? 'ChevronDown' : 'ChevronRight'} />
              <h3>{fieldGroup.name}</h3>
            </div>
            <HelpText>{fieldGroup.fields.length} fields</HelpText>
          </button>
        </div>
      </div>
      {isOpen ? (
        <div className={styles.fieldsContainer}>
          <div className={styles.widthContainer}>
            {fieldGroup.fields.map((k: FieldType) => (
              <Field key={k.id} field={fields[k.id]} locales={locales} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
