import * as React from 'react';

import { Spinner, TextInput, ValidationMessage } from '@contentful/f36-components';
import { LinkSimpleIcon } from '@contentful/f36-icons';
import { Note } from '@contentful/f36-note';
import { t } from '@lingui/core/macro';
import { useDebounce } from 'use-debounce';

import { makeSlug } from './services/makeSlug';
import * as styles from './styles';

interface SlugEditorFieldProps {
  hasError: boolean;
  isUniqueValidationEnabled: boolean;
  isOptionalLocaleWithFallback: boolean;
  isDisabled: boolean;
  value: string | null | undefined;
  locale: string;
  titleValue: string | null | undefined;
  createdAt: string;
  setValue: (value: string | null | undefined) => void;
  performUniqueCheck: (value: string) => Promise<boolean>;
  id?: string;
  maxLength?: number;
}

type CheckerState = 'checking' | 'unique' | 'duplicate';

function useSlugUpdater(
  { value, setValue }: Pick<SlugEditorFieldProps, 'value' | 'setValue'>,
  check: boolean,
  generateSlug: () => string,
) {
  React.useEffect(() => {
    if (check === false) {
      return;
    }
    const newSlug = generateSlug();
    if (newSlug !== value) {
      setValue(newSlug);
    }
  }, [value, generateSlug, check, setValue]);
}

function useUniqueChecker(props: SlugEditorFieldProps) {
  const { performUniqueCheck } = props;
  const [status, setStatus] = React.useState<CheckerState>(props.value ? 'checking' : 'unique');
  const [debouncedValue] = useDebounce(props.value, 1000);

  /**
   * Check the uniqueness of the slug in the current space.
   * The slug is unique if there is no published entry other than the
   * current one, with the same slug.
   */
  React.useEffect(() => {
    if (!debouncedValue) {
      setStatus('unique');
      return;
    }
    setStatus('checking');
    performUniqueCheck(debouncedValue)
      .then((unique) => {
        setStatus(unique ? 'unique' : 'duplicate');
      })
      .catch(() => {
        setStatus('checking');
      });
  }, [debouncedValue, performUniqueCheck]);

  return status;
}

export function SlugEditorFieldStatic(
  props: SlugEditorFieldProps & { onChange?: Function; onBlur?: Function },
) {
  const { hasError, isDisabled, value, setValue, onChange, onBlur, isUniqueValidationEnabled, id } =
    props;

  const status = useUniqueChecker(props);
  const hasDuplicate = status === 'duplicate';
  // If the entry is currently in an error state (e.g. publish-time validation),
  // surface duplicate as an error and suppress the warning to keep messaging exclusive.
  const shouldShowDuplicateAsError = hasDuplicate && isUniqueValidationEnabled && !hasError;
  const shouldShowDuplicateAsWarning = hasDuplicate && !shouldShowDuplicateAsError && !hasError;

  return (
    <div className={styles.inputContainer}>
      <LinkSimpleIcon className={styles.icon} />
      <TextInput
        className={styles.input}
        isInvalid={hasError || shouldShowDuplicateAsError}
        isDisabled={isDisabled}
        value={value || ''}
        id={id}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
          if (onChange) {
            onChange();
          }
        }}
        onBlur={() => {
          if (onBlur) {
            onBlur();
          }
        }}
      />
      {status === 'checking' && (
        <div className={styles.spinnerContainer}>
          <Spinner testId="slug-editor-spinner" />
        </div>
      )}
      {shouldShowDuplicateAsError && (
        <ValidationMessage
          testId="slug-editor-duplicate-error"
          className={styles.uniqueValidationError}
        >
          {t({
            id: 'FieldEditors.Slug.SlugEditorField.DuplicateSlugError',
            message: 'This slug has already been published in another entry',
          })}
        </ValidationMessage>
      )}
      {shouldShowDuplicateAsWarning && (
        <Note
          variant="warning"
          testId="slug-editor-duplicate-warning"
          className={styles.uniqueValidationError}
        >
          {t({
            id: 'FieldEditors.Slug.SlugEditorField.DuplicateSlugWarning',
            message: 'This slug has already been published in another entry.',
          })}
        </Note>
      )}
    </div>
  );
}

export function SlugEditorField(props: SlugEditorFieldProps) {
  const { titleValue, isOptionalLocaleWithFallback, locale, createdAt, value, maxLength } = props;

  const generateSlug = React.useCallback(() => {
    return makeSlug(titleValue, {
      isOptionalLocaleWithFallback: isOptionalLocaleWithFallback,
      locale: locale,
      createdAt: createdAt,
      maxLength: maxLength,
    });
  }, [titleValue, isOptionalLocaleWithFallback, locale, createdAt, maxLength]);

  const areEqual = React.useCallback(() => {
    const potentialSlug = generateSlug();
    return value === potentialSlug;
  }, [generateSlug, value]);

  const [check, setCheck] = React.useState<boolean>(() => {
    if (props.value) {
      if (!props.titleValue) {
        return false;
      }
      return areEqual();
    }
    return true;
  });

  React.useEffect(() => {
    if (areEqual()) {
      setCheck(true);
    }
  }, [props.titleValue, areEqual]);

  useSlugUpdater(props, check, generateSlug);

  return (
    <SlugEditorFieldStatic
      {...props}
      onChange={() => {
        setCheck(false);
      }}
      onBlur={() => {
        if (areEqual()) {
          setCheck(true);
        }
      }}
    />
  );
}
