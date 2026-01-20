/**
 * Query key factories matching user_interface repository structure.
 *
 * IMPORTANT: These must stay in sync with user_interface to enable cache sharing.
 * When updating, check the corresponding file in user_interface repository.
 */

/**
 * Creates a query key for fetching a single entry.
 * Matches the structure used in user_interface for cache sharing.
 *
 * Source: https://github.com/contentful/user_interface/blob/main/src/javascripts/core/react-query/cma/entry/useGetEntry.ts
 *
 * @param spaceId - The space ID
 * @param environmentId - The environment ID
 * @param entryId - The entry ID to fetch
 * @returns Query key array for React Query
 */
export const createGetEntryKey = (spaceId: string, environmentId: string, entryId: string) => {
  return ['spaces', spaceId, 'environments', environmentId, 'entries', 'get', entryId];
};

/**
 * Creates a query key for fetching a single asset.
 * Matches the structure used in user_interface for cache sharing.
 *
 * Source: https://github.com/contentful/user_interface/blob/main/src/javascripts/core/react-query/cma/asset/useGetAsset.ts
 *
 * @param spaceId - The space ID
 * @param environmentId - The environment ID
 * @param assetId - The asset ID to fetch
 * @returns Query key array for React Query
 */
export const createGetAssetKey = (spaceId: string, environmentId: string, assetId: string) => {
  return ['spaces', spaceId, 'environments', environmentId, 'assets', 'get', assetId];
};

/**
 * Creates a query key for fetching a single space.
 * Matches the structure used in user_interface for cache sharing.
 *
 * Source: https://github.com/contentful/user_interface/blob/main/src/javascripts/core/react-query/cma/space/useGetSpace.ts
 *
 * @param spaceId - The space ID to fetch
 * @returns Query key array for React Query
 */
export const createGetSpaceKey = (spaceId: string) => {
  return ['spaces', 'get', spaceId];
};

/**
 * Creates a query key for fetching multiple locales.
 * Matches the structure used in user_interface for cache sharing.
 *
 * Source: https://github.com/contentful/user_interface/blob/main/src/javascripts/core/react-query/cma/locale/useGetManyLocales.ts
 *
 * @param spaceId - The space ID
 * @param environmentId - The environment ID
 * @param params - Optional query parameters
 * @returns Query key array for React Query
 */
export const createGetManyLocalesKey = (
  spaceId: string,
  environmentId: string,
  params: Record<string, unknown> = {},
) => {
  return ['spaces', spaceId, 'environments', environmentId, 'locales', params];
};

/**
 * Creates a query key for fetching a single content type.
 * Matches the structure used in user_interface for cache sharing.
 *
 * Source: https://github.com/contentful/user_interface/blob/main/src/javascripts/core/react-query/cma/contentType/useGetContentType.ts
 *
 * @param spaceId - The space ID
 * @param environmentId - The environment ID
 * @param contentTypeId - The content type ID to fetch
 * @returns Query key array for React Query
 */
export const createGetContentTypeKey = (
  spaceId: string,
  environmentId: string,
  contentTypeId: string,
) => {
  return ['spaces', spaceId, 'environments', environmentId, 'content_types', 'get', contentTypeId];
};

/**
 * Creates a query key for fetching multiple content types.
 * Matches the structure used in user_interface for cache sharing.
 *
 * Source: https://github.com/contentful/user_interface/blob/main/src/javascripts/core/react-query/cma/contentType/useGetManyContentTypes.ts
 *
 * @param spaceId - The space ID
 * @param environmentId - The environment ID
 * @param params - Optional query parameters (e.g., { limit: 1000 })
 * @returns Query key array for React Query
 */
export const createGetManyContentTypesKey = (
  spaceId: string,
  environmentId: string,
  params: Record<string, unknown> = {},
) => {
  const prefix = ['spaces', spaceId, 'environments', environmentId, 'content_types', 'getMany'];
  return Object.keys(params).length === 0 ? prefix : [...prefix, params];
};

// Add more query key factories as needed, always matching user_interface structure
