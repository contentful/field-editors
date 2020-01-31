import React from 'react';
import { TextInput, Icon } from '@contentful/forma-36-react-components';
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
}

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

export function SlugEditorFieldStatic(props: SlugEditorFieldProps) {
  const { hasError, isDisabled, value, setValue } = props;

  useSlugUpdater(props);

  return (
    <div className={styles.inputContainer}>
      <Icon icon="Link" className={styles.icon} />
      <TextInput
        className={styles.input}
        error={hasError}
        disabled={isDisabled}
        value={value || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
        }}
      />
    </div>
  );
}

export function SlugEditorField(props: SlugEditorFieldProps) {
  useSlugUpdater(props);
  return <SlugEditorFieldStatic {...props} />;
}
