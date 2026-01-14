import * as React from 'react';

import { Link, ValidationError } from '@contentful/app-sdk';
import { List, ListItem, TextLink } from '@contentful/f36-components';
import { ArrowSquareOutIcon, InfoIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import type { ContentType, Entry, FieldAPI, LocalesAPI } from '@contentful/field-editor-shared';
import { entityHelpers, useContentTypes } from '@contentful/field-editor-shared';
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
    entries: { id: string; title: string; href: string }[];
  }>({
    loading: true,
    entries: [],
  });

  const allContentTypes = useContentTypes(cma);
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

  const getTitle = React.useCallback(
    (entry: Entry) =>
      entityHelpers.getEntryTitle({
        entry,
        defaultTitle: t({
          id: 'FieldEditors.ValidationErrors.UniquenessError.DefaultTitle',
          message: 'Untitled',
        }),
        localeCode,
        defaultLocaleCode,
        contentType: contentTypesById[entry.sys.contentType.sys.id],
      }),
    [localeCode, defaultLocaleCode, contentTypesById],
  );

  let conflicting: Link<'Entry', 'Link'>[] = [];
  if ('conflicting' in error) {
    conflicting = error.conflicting;
  }
  React.useEffect(() => {
    const entryIds = state.entries.map((entry) => entry.id);
    const conflictIds = conflicting.map((entry) => entry.sys.id);

    // Avoid unnecessary refetching
    if (conflictIds.every((id) => entryIds.includes(id))) {
      return;
    }

    setState((state) => ({ ...state, loading: true }));

    cma.entry
      .getMany({
        query: {
          'sys.id[in]': conflictIds.join(','),
        },
        // opt-out from timeline to compare with current only for now
        releaseId: undefined,
      })
      .then(({ items }) => {
        const entries = items.map((entry) => ({
          id: entry.sys.id,
          title: getTitle(entry),
          href: getEntryURL(entry),
        }));

        setState({
          loading: false,
          entries,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate these dependencies
  }, [getTitle, state.entries, cma, getEntryURL]);

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
          state.entries.map((entry) => (
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

export function ValidationErrors({
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
