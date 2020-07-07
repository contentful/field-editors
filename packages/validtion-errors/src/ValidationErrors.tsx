import * as React from 'react';
import type * as shared from '@contentful/field-editor-shared';
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
  space: shared.SpaceAPI;
  localeCode: string;
  defaultLocaleCode: string;
  getEntryURL: (entry: shared.Entry) => string;
};

function UniquenessError(props: UniquenessErrorProps) {
  const [state, setState] = React.useState<{
    loading: boolean;
    entries: { title: string; href: string }[];
  }>({
    loading: true,
    entries: [],
  });

  const contentTypesById = React.useMemo(
    (): Record<string, shared.ContentType> =>
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

  React.useEffect(() => {
    setState((state) => ({ ...state, loading: true }));

    const getTitle = (entry: shared.Entry) =>
      entityHelpers.getEntryTitle({
        entry,
        defaultTitle: 'Untitled',
        localeCode: props.localeCode,
        defaultLocaleCode: props.defaultLocaleCode,
        contentType: contentTypesById[entry.sys.contentType.sys.id],
      });

    const query = {
      'sys.id[in]': props.error.conflicting?.map((entry) => entry.sys.id).join(','),
    };

    props.space.getEntries<shared.Entry>(query).then(({ items }) => {
      const entries = items.map((entry) => ({
        title: getTitle(entry),
        href: props.getEntryURL(entry),
      }));

      setState({
        loading: false,
        entries,
      });
    });
  }, [props]);

  return (
    <List className={styles.errorList} data-test-id="uniqueness-conflicts-list">
      <li className={styles.errorItem}>
        {state.loading ? (
          <div>Loading title for conflicting entry…</div>
        ) : (
          state.entries.map((entry) => (
            <TextLink
              key={entry.href}
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
  field: shared.FieldAPI;
  space: shared.SpaceAPI;
  locales: shared.LocalesAPI;
  getEntryURL: (entry: shared.Entry) => string;
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
