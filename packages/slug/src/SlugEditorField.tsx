import React from 'react';
import { TextInput, Icon, Spinner, ValidationMessage } from '@contentful/forma-36-react-components';
import { makeSlug } from './services/makeSlug';
import * as styles from './styles';

interface SlugEditorFieldProps {
  hasError: boolean;
  isOptionalLocaleWithFallback: boolean;
  isDisabled: boolean;
  value: string | null | undefined;
  locale: string;
  titleValue: string | null | undefined;
  createdAt: string;
  setValue: (value: string | null | undefined) => void;
  performUniqueCheck: (value: string) => Promise<boolean>;
}

type CheckerState = 'checking' | 'unique' | 'duplicate';

function useSlugUpdater(props: SlugEditorFieldProps) {
  const { value, setValue, createdAt, locale, titleValue, isOptionalLocaleWithFallback } = props;

  React.useEffect(() => {
    const newSlug = makeSlug(titleValue, {
      isOptionalLocaleWithFallback,
      locale,
      createdAt
    });
    if (newSlug !== value) {
      setValue(newSlug);
    }
  }, [value, titleValue, isOptionalLocaleWithFallback]);
}

function useUniqueChecker(props: SlugEditorFieldProps) {
  const { value, performUniqueCheck, isDisabled } = props;
  const [status, setStatus] = React.useState<CheckerState>(value ? 'checking' : 'unique');

  /**
   * Check the uniqueness of the slug in the current space.
   * The slug is unique if there is no published entry other than the
   * current one, with the same slug.
   */
  React.useEffect(() => {
    if (isDisabled) {
      return;
    }
    if (!value) {
      setStatus('unique');
      return;
    }
    setStatus('checking');
    performUniqueCheck(value)
      .then(unique => {
        setStatus(unique ? 'unique' : 'duplicate');
      })
      .catch(() => {
        setStatus('checking');
      });
  }, [value, performUniqueCheck, isDisabled]);

  return status;
}

export function SlugEditorFieldStatic(props: SlugEditorFieldProps) {
  const { hasError, isDisabled, value, setValue } = props;

  const status = useUniqueChecker(props);

  return (
    <div className={styles.inputContainer}>
      <Icon icon="Link" className={styles.icon} />
      <TextInput
        className={styles.input}
        error={hasError || status === 'duplicate'}
        disabled={isDisabled}
        value={value || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
        }}
      />
      {status === 'checking' && (
        <div className={styles.spinnerContainer}>
          <Spinner size="default" />
        </div>
      )}
      {status === 'duplicate' && (
        <ValidationMessage className={styles.uniqueValidationError}>
          This slug has already been published in another entry
        </ValidationMessage>
      )}
    </div>
  );
}

export function SlugEditorField(props: SlugEditorFieldProps) {
  useSlugUpdater(props);
  return <SlugEditorFieldStatic {...props} />;
}
