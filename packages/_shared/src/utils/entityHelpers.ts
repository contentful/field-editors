import get from 'lodash/get';
import isObject from 'lodash/isObject';

import { Asset, ContentType, ContentTypeField, Entry, File } from '../typesEntity';

function titleOrDefault(title: string | undefined, defaultTitle: string): string {
  if (!(title != null && typeof title.valueOf() === 'string')) {
    return defaultTitle;
  }
  if (title) {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      return defaultTitle;
    }
    return trimmedTitle;
  }
  return defaultTitle;
}

export function getFieldValue({
  /**
   * Expects an entity fetched with a flag Skip-Transformation: true
   */
  entity,
  fieldId,
  localeCode,
  defaultLocaleCode,
}: {
  entity: {
    fields: { [key: string]: { [valueKey: string]: string | undefined } };
  };
  fieldId: string;
  localeCode: string;
  defaultLocaleCode: string;
}): string | undefined {
  const values = get(entity, ['fields', fieldId]);
  if (!isObject(values)) {
    return;
  }

  const firstLocaleCode = Object.keys(values)[0];

  return values[localeCode] || values[defaultLocaleCode] || values[firstLocaleCode];
}

export function getAssetTitle({
  asset,
  localeCode,
  defaultLocaleCode,
  defaultTitle,
}: {
  asset: Asset;
  localeCode: string;
  defaultLocaleCode: string;
  defaultTitle: string;
}) {
  const title = getFieldValue({
    entity: { fields: { title: asset.fields?.title } },
    fieldId: 'title',
    localeCode,
    defaultLocaleCode,
  });
  return titleOrDefault(title, defaultTitle);
}

/**
 * Returns true if field is an Asset
 *
 * @param field
 * @returns {boolean}
 */
export const isAssetField = (field: ContentTypeField): boolean =>
  field.type === 'Link' && field.linkType === 'Asset';

/**
 * Returns true if field is a Title
 */
export function isDisplayField({
  field,
  contentType,
}: {
  field: ContentTypeField;
  contentType: ContentType;
}): boolean {
  return field.id === contentType.displayField;
}

/**
 * Returns true if field is a short Description
 */
export function isDescriptionField({
  field,
  contentType,
}: {
  field: ContentTypeField;
  contentType: ContentType;
}) {
  const isTextField = (field: ContentTypeField) => ['Symbol', 'Text'].includes(field.type);
  const isMaybeSlugField = (field: ContentTypeField) => /\bslug\b/.test(field.name);
  return isTextField(field) && !isDisplayField({ field, contentType }) && !isMaybeSlugField(field);
}

export function getEntityDescription({
  entity,
  contentType,
  localeCode,
  defaultLocaleCode,
}: {
  entity: Entry;
  contentType?: ContentType;
  localeCode: string;
  defaultLocaleCode: string;
}): string {
  if (!contentType) {
    return '';
  }

  const descriptionField = contentType.fields.find((field) =>
    isDescriptionField({ field, contentType }),
  );

  if (!descriptionField) {
    return '';
  }

  return (
    getFieldValue({ entity, fieldId: descriptionField.id, localeCode, defaultLocaleCode }) || ''
  );
}

export function getEntryTitle({
  entry,
  contentType,
  localeCode,
  defaultLocaleCode,
  defaultTitle,
}: {
  entry: Entry;
  contentType?: ContentType;
  localeCode: string;
  defaultLocaleCode: string;
  defaultTitle: string;
}) {
  let title;

  if (!contentType) {
    return defaultTitle;
  }

  const displayField = contentType.displayField;
  if (!displayField) {
    return defaultTitle;
  }

  const displayFieldInfo = contentType.fields.find((field) => field.id === displayField);

  if (!displayFieldInfo) {
    return defaultTitle;
  }

  // when localization for a field is "turned off",
  // we don't clean up the "old" localized data, so it is still in the response.
  // Therefore, we're checking if displayField is localizable.
  if (displayFieldInfo.localized) {
    title = getFieldValue({
      entity: entry,
      fieldId: displayField,
      localeCode,
      defaultLocaleCode,
    });
    if (!title) {
      // Older content types may return id/apiName, but some entry lookup paths do not fetch raw data
      // In order to still return a title in this case, look for displayField as apiName in content type,
      // ...but still look for displayField as a field in the entry
      title = getFieldValue({
        entity: entry,
        fieldId: displayFieldInfo.id,
        localeCode,
        defaultLocaleCode,
      });
    }
  } else {
    title = getFieldValue({
      entity: entry,
      fieldId: displayField,
      defaultLocaleCode,
      localeCode: '',
    });
    if (!title) {
      title = getFieldValue({
        entity: entry,
        fieldId: displayFieldInfo.id,
        defaultLocaleCode,
        localeCode: '',
      });
    }
  }

  return titleOrDefault(title, defaultTitle);
}

type FieldStatus = 'draft' | 'published' | 'changed';

export type EntitySys = Entry['sys'] | Asset['sys'];

/**
 * Returns the status of the entry/asset
 * If a locale code(s) is provided it will pick up the most advanced state for these locale(s)
 * (Not aggregated, this means published + draft is published and not changed)
 * - deleted
 * - archived
 * - changed
 * - published
 * - draft
 */
export function getEntityStatus(sys: EntitySys, localeCodes?: string | string[]) {
  if (!sys || (sys.type !== 'Entry' && sys.type !== 'Asset')) {
    throw new TypeError('Invalid entity metadata object');
  }

  if (sys.deletedVersion) {
    return 'deleted';
  }

  if (sys.archivedVersion) {
    return 'archived';
  }

  // TODO: remove the condition, once locale based publishing is GA
  // Then we don't need the publishedVersion calculation anymore
  if (sys.fieldStatus && localeCodes) {
    let status: FieldStatus = 'draft';
    const locales = Array.isArray(localeCodes) ? localeCodes : [localeCodes];

    for (const [localeCode, fieldStatus] of Object.entries(sys.fieldStatus['*'])) {
      if (!locales || locales.includes(localeCode)) {
        if (fieldStatus === 'changed') {
          status = fieldStatus;
          break;
        }
        if (fieldStatus === 'published') {
          status = fieldStatus;
        }
      }
    }

    return status;
  }

  if (sys.publishedVersion) {
    if (sys.version > sys.publishedVersion + 1) {
      return 'changed';
    } else {
      return 'published';
    }
  }

  return 'draft';
}

/**@deprecated use `getEntityStatus` */
export function getEntryStatus(sys: Entry['sys'], localeCodes?: string | string[]) {
  return getEntityStatus(sys, localeCodes);
}

/**
 * Gets a promise resolving with a localized asset image field representing a
 * given entities file. The promise may resolve with null.
 */
export const getEntryImage = async (
  {
    entry,
    contentType,
    localeCode,
  }: {
    entry: Entry;
    contentType?: ContentType;
    localeCode: string;
    defaultLocaleCode: string;
  },
  getAsset: (assetId: string) => Promise<unknown>,
): Promise<null | File> => {
  if (!contentType) {
    return null;
  }

  const assetLink = contentType.fields.find(isAssetField);

  if (!assetLink) {
    return null;
  }

  const assetId = get(entry.fields, [assetLink.id, localeCode, 'sys', 'id']);

  if (!assetId) {
    return null;
  }

  try {
    const asset = await getAsset(assetId);
    const file = get(asset, ['fields', 'file', localeCode]);
    const isImage = Boolean(get(file, ['details', 'image'], false));
    return isImage ? file : null;
  } catch (e) {
    return null;
  }
};

const TRANSFORMATIONS_ENDPOINTS = {
  'downloads.ctfassets.net': 'images.ctfassets.net',
  'downloads.flinkly.com': 'images.flinkly.com',
};

const DOWNLOADS_ENDPOINTS = Object.keys(TRANSFORMATIONS_ENDPOINTS);

type TransformationEndpointKey = keyof typeof TRANSFORMATIONS_ENDPOINTS;

export const getResolvedImageUrl = (
  url: string,
  params?: { w?: number; h?: number; fit?: string },
): string => {
  try {
    // Handle protocol-relative URLs by adding https: temporarily
    const urlToParse = url.startsWith('//') ? `https:${url}` : url;
    const parsedUrl = new URL(urlToParse);

    // Replace downloads domain with images domain if it matches
    if (DOWNLOADS_ENDPOINTS.includes(parsedUrl.hostname)) {
      parsedUrl.hostname =
        TRANSFORMATIONS_ENDPOINTS[parsedUrl.hostname as TransformationEndpointKey];
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          parsedUrl.searchParams.set(key, value.toString());
        }
      });
    }

    const result = parsedUrl.toString();
    // If original URL was protocol-relative, restore it
    return url.startsWith('//') ? result.replace(/^https:/, '') : result;
  } catch {
    // fallback to previous behaviour for relative URLs
    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }
};
