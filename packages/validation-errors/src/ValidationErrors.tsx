import React from 'react';
import diff from 'lodash/difference';
import type {
  SpaceAPI,
  Entry,
  ContentType,
  FieldAPI,
  LocalesAPI,
} from '@contentful/field-editor-shared';
import { entityHelpers } from '@contentful/field-editor-shared';
import { TextLink, List } from '@contentful/forma-36-react-components';

import * as styles from './styles';

export type ValidationError = {
  name: string;
  message: string;
  conflicting?: Array<{ sys: { id: string } }>;
};

type UniquenessErrorProps = {
  error: ValidationError;
  space: SpaceAPI;
  localeCode: string;
  defaultLocaleCode: string;
  getEntryURL: (entry: Entry) => string;
};

function UniquenessError(props: UniquenessErrorProps) {
  const [state, setState] = React.useState<{
    loading: boolean;
    entries: { id: string; title: string; href: string }[];
  }>({
    loading: true,
    entries: [],
  });

  const contentTypesById = React.useMemo(
    (): Record<string, ContentType> =>
      // Maps ID => Content Type
      props.space.getCachedContentTypes().reduce(
        (prev, ct) => ({
          ...prev,
          [ct.sys.id]: ct,
        }),
        {}
      ),
    [props.space]
  );

  const getTitle = React.useCallback(
    (entry: Entry) =>
      entityHelpers.getEntryTitle({
        entry,
        defaultTitle: 'Untitled',
        localeCode: props.localeCode,
        defaultLocaleCode: props.defaultLocaleCode,
        contentType: contentTypesById[entry.sys.contentType.sys.id],
      }),
    [props.localeCode, props.defaultLocaleCode, contentTypesById]
  );

  React.useEffect(() => {
    const conflictIds = props.error.conflicting?.map((entry) => entry.sys.id) || [];

    const entryIds = state.entries.map((entry) => entry.id);

    // Avoid unnecessary refetching
    if (diff(conflictIds, entryIds).length === 0) {
      return;
    }

    setState((state) => ({ ...state, loading: true }));

    const query = {
      'sys.id[in]': conflictIds.join(','),
    };

    props.space.getEntries<Entry>(query).then(({ items }) => {
      const entries = items.map((entry) => ({
        id: entry.sys.id,
        title: getTitle(entry),
        href: props.getEntryURL(entry),
      }));

      setState({
        loading: false,
        entries,
      });
    });
  }, [getTitle, state.entries, props.error.conflicting, props.space.getEntries, props.getEntryURL]);

  return (
    <List className={styles.errorList} data-test-id="uniqueness-conflicts-list">
      <li className={styles.errorItem}>
        {state.loading ? (
          <div>Loading title for conflicting entry…</div>
        ) : (
          state.entries.map((entry) => (
            <TextLink
              key={entry.id}
              href={entry.href}
              icon="ExternalLink"
              iconPosition="right"
              linkType="negative"
              rel="noopener noreferrer">
              {entry.title}
            </TextLink>
          ))
        )}
      </li>
    </List>
  );
}

export interface ValidationErrorsProps {
  field: FieldAPI;
  space: SpaceAPI;
  locales: LocalesAPI;
  getEntryURL: (entry: Entry) => string;
}

export function ValidationErrors(props: ValidationErrorsProps) {
  const [errors, setErrors] = React.useState<ValidationError[]>([]);

  React.useEffect(() => {
    const onErrors = (errors?: ValidationError[]) => {
      setErrors(errors || []);
    };

    return props.field.onSchemaErrorsChanged(onErrors);
  }, [props.field]);

  if (errors.length === 0) {
    return null;
  }

  return (
    <List className={styles.errorList}>
      {errors.map((error, index) => {
        return (
          <li
            key={index}
            role="status"
            aria-roledescription="field-locale-schema"
            data-error-code={`entry.schema.${error.name}`}>
            {error.message}
            {error.name === 'unique' && (
              <UniquenessError
                error={error}
                space={props.space}
                localeCode={props.field.locale}
                defaultLocaleCode={props.locales.default}
                getEntryURL={props.getEntryURL}
              />
            )}
          </li>
        );
      })}
    </List>
  );
}
