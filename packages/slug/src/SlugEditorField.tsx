import React from 'react';
import { TextInput } from '@contentful/forma-36-react-components';

interface SlugEditorFieldProps {
  hasError: boolean;
  isOptionalLocaleWithFallback: boolean;
  isDisabled: boolean;
  isPublished: boolean;
  value: string | null | undefined;
  titleValue: string | null | undefined;
  setValue: (value: string | null | undefined) => void;
}

function useSlugUpdater(props: SlugEditorFieldProps) {
  const { hasError, isDisabled, isPublished, value, setValue, titleValue } = props;

  React.useEffect(() => {
    if (isPublished) {
      return;
    }
  }, [value, titleValue, isPublished]);
}

export function SlugEditorField(props: SlugEditorFieldProps) {
  const { hasError, isDisabled, value, setValue } = props;

  useSlugUpdater(props);

  return (
    <TextInput
      error={hasError}
      disabled={isDisabled}
      value={value || ''}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
      }}
    />
  );
}
