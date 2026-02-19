/**
 * Re-export query client utilities from shared package.
 * This maintains backwards compatibility while using the shared implementation.
 */
export {
  SharedQueryClientProvider,
  useQueryClient,
  useQuery,
} from '@contentful/field-editor-shared/react-query';
