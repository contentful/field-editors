import * as React from 'react';
import { cx } from 'emotion';
import { HelpText, FieldGroup, FormLabel } from '@contentful/forma-36-react-components';
import { ValidationErrors } from '@contentful/field-editor-validation-errors';
import type { FieldExtensionSDK, Entry } from '@contentful/field-editor-shared';
import { styles } from './FieldWrapper.styles';

type FieldWrapperProps = {
  name: string;
  sdk: FieldExtensionSDK;
  getEntryURL: (entry: Entry) => string;
  className?: string;
  showFocusBar?: boolean;
  children: React.ReactNode;
  renderHeading?: (name: string) => JSX.Element | null;
  renderHelpText?: (helpText: string) => JSX.Element | null;
};

export const FieldWrapper: React.FC<FieldWrapperProps> = function (props: FieldWrapperProps) {
  const {
    name,
    sdk,
    getEntryURL,
    className,
    children,
    renderHeading,
    renderHelpText,
    showFocusBar = true,
  } = props;
  const { field } = sdk;
  const helpText = (sdk.parameters?.instance as any)?.helpText ?? '';
  const required = field.required;

  const [hasErrors, setHasErrors] = React.useState(false);
  React.useEffect(() => {
    return field.onSchemaErrorsChanged((errors: unknown[]) => {
      setHasErrors((errors || []).length > 0);
    });
  });

  return (
    <FieldGroup
      testId="entity-field-controls"
      data-test-id="entity-field-controls"
      className={cx(showFocusBar && styles.withFocusBar, className)}
      aria-invalid={hasErrors}>
      {renderHeading ? (
        renderHeading(name)
      ) : (
        <FormLabel className={styles.label} htmlFor={field.id}>
          {name}
          {required && <span> (required)</span>}
        </FormLabel>
      )}

      {children}

      <ValidationErrors
        field={field}
        space={sdk.space}
        locales={sdk.locales}
        getEntryURL={getEntryURL}
      />

      {renderHelpText ? (
        renderHelpText(helpText)
      ) : (
        <HelpText className={styles.helpText} testId="field-hint">
          {helpText}
        </HelpText>
      )}
    </FieldGroup>
  );
};
