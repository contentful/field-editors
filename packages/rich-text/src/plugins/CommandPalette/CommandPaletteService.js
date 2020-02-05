import _ from 'lodash-es';
import { isNodeTypeEnabled } from '../../validations';
import { INLINES, BLOCKS } from '@contentful/rich-text-types';
// TODO: xxx Get this another way!
// import * as EntityHelpers from 'app/entity_editor/entityHelpers';

export async function fetchContentTypes(widgetAPI) {
  const contentTypes = await widgetAPI.space.getContentTypes();
  return _.uniqBy(contentTypes.items, contentType => contentType.name);
}

export async function fetchAssets(widgetAPI, query = '') {
  const assets = await widgetAPI.space.getAssets({ query });
  return assets.items.map(asset => ({
    contentTypeName: 'Asset',
    displayTitle: asset.fields.title ? asset.fields.title[widgetAPI.field.locale] : 'Untitled',
    id: asset.sys.id,
    entry: asset,
    thumbnail:
      asset.fields.file &&
      asset.fields.file[widgetAPI.field.locale] &&
      `${asset.fields.file[widgetAPI.field.locale].url}?h=30`
  }));
}

export async function fetchEntries(widgetAPI, contentType, query = '') {
  // TODO:xxx
  // const entityHelpers = EntityHelpers.newForLocale(widgetAPI.field.locale);
  const entries = await widgetAPI.space.getEntries({
    content_type: contentType.sys.id,
    query
  });

  return Promise.all(
    entries.items.map(async entry => {
      // TODO:xxx
      // const description = await entityHelpers.entityDescription(entry);
      // const displayTitle = await entityHelpers.entityTitle(entry);
      const description = 'Entity description';
      const displayTitle = 'Entity title';
      return {
        contentTypeName: contentType.name,
        displayTitle: displayTitle || 'Untitled',
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
  constructor(field, permissions) {
    this.field = field;
    this.permissions = permissions;
  }

  // TODO:xxx Let's create dedicated functions for assets so we do not have to pass a CT.

  maybeBuildEmbedAction(embedType, callback) {
    if (!isNodeTypeEnabled(field, embedType)) {
      return false;
    }
    const isAsset = !contentType;
    if (!isAsset && !isValidLinkedContentType(field, contentType, embedType)) {
      return false;
    }

    buildAction(embedType, contentType, callback);
  }

  maybeBuildCreateAndEmbedAction(embedType, contentType, callback) {
    if (!isNodeTypeEnabled(field, embedType)) {
      return false;
    }

    const isAsset = !contentType;
    if (isAsset && !this.permissions.canCreateAsset) {
      return false;
    } else {
      if (!isValidLinkedContentType(field, contentType, embedType)) {
        return false;
      }
      if (!this.permissions.canCreateEntryOfContentType[contentType.sys.id]) {
        return false;
      }
    }

    buildAction(embedType, contentType, callback);
  }
}

function buildAction(embedType, contentType, callback) {
  const isAsset = !contentType;
  const isInline = embedType === INLINES.EMBEDDED_ENTRY;
  const label = `Create and embed ${isAsset ? 'Asset' : contentType.name} ${
    isInline ? ' - Inline' : ''
  }`;

  const icon = isInline ? 'EmbeddedEntryInline' : 'EmbeddedEntryBlock';

  return {
    label,
    group: isAsset ? 'Assets' : contentType.name,
    callback,
    icon
  };
}
