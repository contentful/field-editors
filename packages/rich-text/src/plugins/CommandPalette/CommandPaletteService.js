import { isNodeTypeEnabled } from '../../validations';
import { INLINES, BLOCKS } from '@contentful/rich-text-types';
import { entityHelpers } from '@contentful/field-editor-shared';

const ACTIONS = {
  EMBED: 'embed',
  CREATE_EMBED: 'create_embed'
};

export async function fetchAssets(sdk, query = '') {
  const assets = await sdk.space.getAssets({ query });
  return assets.items.map(asset => ({
    contentTypeName: 'Asset',
    displayTitle: asset.fields.title ? asset.fields.title[sdk.field.locale] : 'Untitled',
    id: asset.sys.id,
    entry: asset,
    thumbnail:
      asset.fields.file &&
      asset.fields.file[sdk.field.locale] &&
      `${asset.fields.file[sdk.field.locale].url}?h=30`
  }));
}

export async function fetchEntries(sdk, contentType, query = '') {
  const entries = await sdk.space.getEntries({
    content_type: contentType.sys.id,
    query
  });

  return Promise.all(
    entries.items.map(async entry => {
      const description = entityHelpers.getEntityDescription({
        contentType,
        entity: entry,
        localeCode: sdk.field.locale,
        defaultLocaleCode: sdk.locales.default
      });
      const displayTitle = entityHelpers.getEntryTitle({
        entry,
        contentType,
        localeCode: sdk.field.locale,
        defaultLocaleCode: sdk.locales.default,
        defaultTitle: 'Untitled'
      });
      return {
        contentTypeName: contentType.name,
        displayTitle: displayTitle,
        id: entry.sys.contentType.sys.id,
        description,
        entry
      };
    })
  );
}

/**
 * @description
 * Checks the field validations if the current content type is valid to be linked/embedded.
 *
 * @param {Object} field
 * @param {Object} contentType
 * @param {String} embedType
 * @returns {Boolean}
 */
export const isValidLinkedContentType = (field, contentType, embedType) => {
  if (field.validations.length === 0) {
    return true;
  }

  const nodes = field.validations.filter(val => val.nodes)[0].nodes;

  if (nodes[embedType] === undefined) {
    return true;
  }

  return !!nodes[embedType]
    .filter(typeVal => typeVal.linkContentType)
    .reduce((pre, cur) => [...pre, cur.linkContentType], [])
    .reduce((pre, cur) => [...pre, ...cur], [])
    .find(ct => ct === contentType.sys.id);
};

export const isEmbeddingEnabled = field =>
  isNodeTypeEnabled(field, BLOCKS.EMBEDDED_ASSET) ||
  isNodeTypeEnabled(field, BLOCKS.EMBEDDED_ENTRY) ||
  isNodeTypeEnabled(field, INLINES.EMBEDDED_ENTRY);

export class CommandPaletteActionBuilder {
  constructor(sdk) {
    this.sdk = sdk;
  }

  // TODO: Let's create dedicated functions for assets so we do not have to pass a CT.

  maybeBuildEmbedAction(embedType, contentType, callback) {
    if (!isNodeTypeEnabled(this.sdk.field, embedType)) {
      return false;
    }
    const isAsset = !contentType;
    if (!isAsset && !isValidLinkedContentType(this.sdk.field, contentType, embedType)) {
      return false;
    }

    return buildAction(embedType, contentType, ACTIONS.EMBED, callback);
  }

  async maybeBuildCreateAndEmbedAction(embedType, contentType, callback) {
    if (!isNodeTypeEnabled(this.sdk.field, embedType)) {
      return false;
    }

    const isAsset = !contentType;
    if (!isAsset) {
      if (!isValidLinkedContentType(this.sdk.field, contentType, embedType)) {
        return false;
      }

      const canCreateEntryOfContentType = await this.sdk.access.can('create', {
        sys: {
          type: 'Entry',
          contentType: {
            sys: contentType.sys
          }
        }
      });

      if (canCreateEntryOfContentType === false) {
        return false;
      }
    } else {
      const canCreateAssets = await this.sdk.access.can('create', 'Asset');
      if (canCreateAssets === false) {
        return false;
      }
    }

    return buildAction(embedType, contentType, ACTIONS.CREATE_EMBED, callback);
  }
}

function buildAction(embedType, contentType, actionType, callback) {
  const isAsset = !contentType;
  const isInline = embedType === INLINES.EMBEDDED_ENTRY;
  const label = `${actionType === ACTIONS.EMBED ? 'Embed' : 'Create and embed'} ${
    isAsset ? 'Asset' : contentType.name
  } ${isInline ? ' - Inline' : ''}`;

  const icon = isInline ? 'EmbeddedEntryInline' : 'EmbeddedEntryBlock';

  return {
    label,
    group: isAsset ? 'Assets' : contentType.name,
    callback,
    icon
  };
}
