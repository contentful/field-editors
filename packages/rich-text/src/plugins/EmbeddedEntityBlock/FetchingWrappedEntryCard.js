import * as React from 'react';
import PropTypes from 'prop-types';
import { EntryCard } from '@contentful/forma-36-react-components';
import {
  useEntities,
  MissingEntityCard,
  WrappedEntryCard,
} from '@contentful/field-editor-reference';

export function FetchingWrappedEntryCard(props) {
  const { loadEntry, entries } = useEntities();

  React.useEffect(() => {
    loadEntry(props.entryId);
  }, [props.entryId]);

  const entry = entries[props.entryId];

  React.useEffect(() => {
    if (entry) {
      props.onEntityFetchComplete && props.onEntityFetchComplete();
    }
  }, [entry]);

  if (entry === 'failed') {
    return (
      <MissingEntityCard
        entityType="Entry"
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  if (entry === undefined) {
    return <EntryCard size="default" loading />;
  }

  const contentType = props.sdk.space
    .getCachedContentTypes()
    .find((contentType) => contentType.sys.id === entry.sys.contentType.sys.id);

  return (
    <WrappedEntryCard
      getAsset={props.sdk.space.getAsset}
      getEntityScheduledActions={props.sdk.space.getEntityScheduledActions}
      entryUrl={props.getEntryUrl && props.getEntryUrl(entry.sys.id)}
      size="default"
      isSelected={props.isSelected}
      isDisabled={props.isDisabled}
      localeCode={props.locale}
      defaultLocaleCode={props.sdk.locales.default}
      contentType={contentType}
      entry={entry}
      onEdit={props.onEdit}
      onRemove={props.onRemove}
      isClickable={false}
    />
  );
}

FetchingWrappedEntryCard.propTypes = {
  sdk: PropTypes.object.isRequired,
  entryId: PropTypes.string.isRequired,
  locale: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onRemove: PropTypes.func,
  onEdit: PropTypes.func,
  getEntryUrl: PropTypes.func,
  onEntityFetchComplete: PropTypes.func,
};
