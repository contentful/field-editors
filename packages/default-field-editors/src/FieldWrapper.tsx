import * as React from 'react';
import { cx } from 'emotion';
import { FormControl } from '@contentful/f36-components';
import { ValidationErrors } from '@contentful/field-editor-validation-errors';
import type { FieldExtensionSDK, Entry } from '@contentful/field-editor-shared';
import { styles } from './FieldWrapper.styles';

type FieldWrapperProps = {
  name: string;
  sdk: FieldExtensionSDK;
  /**
   * Generates a link to another entry with the same value when a "non unique" validation error occurs
   */
  getEntryURL?: (entry: Entry) => string;
  className?: string;
  showFocusBar?: boolean;
  children: React.ReactNode;
  renderHeading?: (name: string) => JSX.Element | null;
  renderHelpText?: (helpText: string) => JSX.Element | null;
};

export const FieldWrapper: React.FC<FieldWrapperProps> = function (props: FieldWrapperProps) {
  const { ids } = props.sdk;
  const defaultGetEntryUrl = (entry: Entry) =>
    `/spaces/${ids.space}/environments/${ids.environmentAlias || ids.environment}/entries/${
      entry.sys.id
    }`;
  const {
    name,
    sdk,
    className,
    children,
    renderHeading,
    renderHelpText,
    showFocusBar = true,
    getEntryURL = defaultGetEntryUrl,
  } = props;
  const { field } = sdk;
  const helpText = (sdk.parameters?.instance as any)?.helpText ?? '';

  const [hasErrors, setHasErrors] = React.useState(false);
  React.useEffect(() => {
    return field.onSchemaErrorsChanged((errors: unknown[]) => {
      setHasErrors((errors || []).length > 0);
    });
  }, [field]);

  const fieldControlId = [field.id, field.locale].filter((item) => item).join('-');

  return (
    <FormControl
      id={fieldControlId}
      testId="entity-field-controls"
      data-test-id="entity-field-controls"
      className={cx(showFocusBar && styles.withFocusBar, className)}
      aria-invalid={hasErrors}
      isRequired={field.required}>
      {renderHeading ? (
        renderHeading(name)
      ) : (
        <FormControl.Label className={styles.label}>{name}</FormControl.Label>
      )}

      {children}

      <ValidationErrors
        field={field}
        space={sdk.space}
        locales={sdk.locales}
        getEntryURL={getEntryURL || defaultGetEntryUrl}
      />

      {renderHelpText ? (
        renderHelpText(helpText)
      ) : (
        <FormControl.HelpText testId="field-hint" className={styles.helpText}>
          {helpText}
        </FormControl.HelpText>
      )}
    </FormControl>
  );
};
