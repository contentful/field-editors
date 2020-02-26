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

function useSlugUpdater(props: SlugEditorFieldProps, check: boolean) {
  const { value, setValue, createdAt, locale, titleValue, isOptionalLocaleWithFallback } = props;

  React.useEffect(() => {
    if (check === false) {
      return;
    }
    const newSlug = makeSlug(titleValue, {
      isOptionalLocaleWithFallback,
      locale,
      createdAt
    });
    if (newSlug !== value) {
      setValue(newSlug);
    }
  }, [value, titleValue, isOptionalLocaleWithFallback, check]);
}

function useUniqueChecker(props: SlugEditorFieldProps) {
  const { value, performUniqueCheck } = props;
  const [status, setStatus] = React.useState<CheckerState>(value ? 'checking' : 'unique');

  /**
   * Check the uniqueness of the slug in the current space.
   * The slug is unique if there is no published entry other than the
   * current one, with the same slug.
   */
  React.useEffect(() => {
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
  }, [value, performUniqueCheck]);

  return status;
}

export function SlugEditorFieldStatic(
  props: SlugEditorFieldProps & { onChange?: Function; onBlur?: Function }
) {
  const { hasError, isDisabled, value, setValue, onChange, onBlur } = props;

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
          <Spinner testId="slug-editor-spinner" size="default" />
        </div>
      )}
      {status === 'duplicate' && (
        <ValidationMessage
          testId="slug-editor-duplicate-error"
          className={styles.uniqueValidationError}>
          This slug has already been published in another entry
        </ValidationMessage>
      )}
    </div>
  );
}

export function SlugEditorField(props: SlugEditorFieldProps) {
  const areEqual = () => {
    const potentialSlug = makeSlug(props.titleValue, {
      isOptionalLocaleWithFallback: props.isOptionalLocaleWithFallback,
      locale: props.locale,
      createdAt: props.createdAt
    });
    return props.value === potentialSlug;
  };

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
  }, [props.titleValue]);

  useSlugUpdater(props, check);

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
