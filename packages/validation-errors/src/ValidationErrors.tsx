import * as React from 'react';

import { ValidationError } from '@contentful/app-sdk';
import { List, ListItem, TextLink } from '@contentful/f36-components';
import { ArrowSquareOutIcon, InfoIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import type { ContentType, Entry, FieldAPI, LocalesAPI } from '@contentful/field-editor-shared';
import { entityHelpers } from '@contentful/field-editor-shared';
import {
  SharedQueryClientProvider,
  useContentTypes,
} from '@contentful/field-editor-shared/react-query';
import { t } from '@lingui/core/macro';
import type { PlainClientAPI } from 'contentful-management';

import * as styles from './styles';

type UniquenessErrorProps = {
  error: ValidationError;
  cma: PlainClientAPI;
  localeCode: string;
  defaultLocaleCode: string;
  getEntryURL: (entry: Entry) => string;
};

function UniquenessError({
  error,
  cma,
  localeCode,
  defaultLocaleCode,
  getEntryURL,
}: UniquenessErrorProps) {
  const [state, setState] = React.useState<{
    loading: boolean;
    entries: Entry[];
  }>({
    loading: true,
    entries: [],
  });

  const { contentTypes: allContentTypes } = useContentTypes(cma);
  const contentTypesById = React.useMemo(
    () =>
      allContentTypes.reduce(
        (prev, ct) => ({
          ...prev,
          [ct.sys.id]: ct,
        }),
        {} as Record<string, ContentType>,
      ),
    [allContentTypes],
  );

  // Calculate conflict key from error
  const conflictKey = React.useMemo(() => {
    const conflicting = 'conflicting' in error ? error.conflicting : [];
    return conflicting
      .map((entry) => entry.sys.id)
      .sort()
      .join(',');
  }, [error]);

  React.useEffect(() => {
    // If we have no conflict key (empty or no conflicting), reset
    if (!conflictKey) {
      setState({ loading: false, entries: [] });
      return;
    }

    setState({ loading: true, entries: [] });

    const conflicting = 'conflicting' in error ? error.conflicting : [];
    const conflictIds = conflicting.map((entry) => entry.sys.id);

    cma.entry
      .getMany({
        query: {
          'sys.id[in]': conflictIds.join(','),
        },
        // opt-out from timeline to compare with current only for now
        releaseId: undefined,
      })
      .then(({ items }) => {
        setState({
          loading: false,
          entries: items,
        });
      });
  }, [conflictKey, error, cma]);

  // Compute display data from loaded entries and content types
  const displayEntries = React.useMemo(() => {
    return state.entries.map((entry) => ({
      id: entry.sys.id,
      title: entityHelpers.getEntryTitle({
        entry,
        defaultTitle: t({
          id: 'FieldEditors.ValidationErrors.UniquenessError.DefaultTitle',
          message: 'Untitled',
        }),
        localeCode,
        defaultLocaleCode,
        contentType: contentTypesById[entry.sys.contentType.sys.id],
      }),
      href: getEntryURL(entry),
    }));
  }, [state.entries, contentTypesById, localeCode, defaultLocaleCode, getEntryURL]);

  return (
    <List className={styles.errorList} testId="validation-errors-uniqueness">
      <ListItem className={styles.entryLink}>
        {state.loading ? (
          <div>
            {t({
              id: 'FieldEditors.ValidationErrors.UniquenessError.LoadingMessage',
              message: 'Loading title for conflicting entry…',
            })}
          </div>
        ) : (
          displayEntries.map((entry) => (
            <TextLink
              key={entry.id}
              href={entry.href}
              icon={<ArrowSquareOutIcon />}
              alignIcon="end"
              variant="negative"
              target="_blank"
              rel="noopener noreferrer"
            >
              {entry.title}
            </TextLink>
          ))
        )}
      </ListItem>
    </List>
  );
}

export interface ValidationErrorsProps {
  field: FieldAPI;
  cma: PlainClientAPI;
  locales: LocalesAPI;
  errorMessageOverride?: (message: string | undefined) => React.ReactNode;
  getEntryURL: (entry: Entry) => string;
}

function ValidationErrorsInternal({
  field,
  cma,
  locales,
  errorMessageOverride,
  getEntryURL,
}: ValidationErrorsProps) {
  const [errors, setErrors] = React.useState<ValidationError[]>([]);

  React.useEffect(() => {
    const onErrors = (errors?: ValidationError[]) => {
      setErrors(errors || []);
    };

    return field.onSchemaErrorsChanged(onErrors);
  }, [field]);

  if (errors.length === 0) {
    return null;
  }

  return (
    <List className={styles.errorList} testId="validation-errors">
      {errors.map((error, index) => {
        return (
          <li
            key={index}
            role="status"
            aria-roledescription="field-locale-schema"
            data-error-code={`entry.schema.${error.name}`}
            className={styles.errorItem}
          >
            <InfoIcon color={tokens.colorNegative} />
            <div className={styles.errorMessage}>
              {errorMessageOverride?.(error.message) ?? error.message}
              {error.name === 'unique' && (
                <UniquenessError
                  cma={cma}
                  error={error}
                  localeCode={field.locale}
                  defaultLocaleCode={locales.default}
                  getEntryURL={getEntryURL}
                />
              )}
            </div>
          </li>
        );
      })}
    </List>
  );
}

export function ValidationErrors(props: ValidationErrorsProps) {
  return (
    <SharedQueryClientProvider>
      <ValidationErrorsInternal {...props} />
    </SharedQueryClientProvider>
  );
}
