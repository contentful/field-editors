import { AssetProps, EntryProps } from 'contentful-management/types';

import * as assetsFixtures from './asset';
import * as contentTypes from './content-type';
import * as entriesFixtures from './entry';
import * as locales from './locale';
import * as spaces from './space';

// TS doesn't recognize sys.contentType as deprecated for assets here, so we need to cast it first
export const assets = assetsFixtures as unknown as Record<string, AssetProps>;
export const entries = entriesFixtures as Record<string, EntryProps>;

export { contentTypes, locales, spaces };
