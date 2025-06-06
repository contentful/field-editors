import type { ReleaseV2Props } from '@contentful/field-editor-shared';
import type { CollectionProp, LocaleProps } from 'contentful-management';

import type { ReleaseAction } from '../types';

export type ParsedReleaseParams = {
  releaseVersionMap: Map<string, Map<string, ReleaseAction>>;
  locales: LocaleProps[];
  activeRelease: ReleaseV2Props;
  isActiveReleaseLoading: boolean;
  releases: CollectionProp<ReleaseV2Props>;
};

type RawReleaseParams = {
  releaseVersionMap: Record<string, Record<string, ReleaseAction>>;
  locales: LocaleProps[];
  activeRelease: ReleaseV2Props;
  isActiveReleaseLoading: boolean;
  releases: CollectionProp<ReleaseV2Props>;
};

export function parseReleaseParams(raw: string): ParsedReleaseParams {
  let parsedRaw: RawReleaseParams;
  try {
    parsedRaw = JSON.parse(raw) as RawReleaseParams;
  } catch (e) {
    throw new Error('Failed to parse release parameters: invalid JSON');
  }

  // Reconstruct to real Map structure
  const releaseVersionMap = new Map<string, Map<string, ReleaseAction>>();
  for (const [entryId, innerObj] of Object.entries(parsedRaw.releaseVersionMap)) {
    const innerMap = new Map<string, ReleaseAction>();
    for (const [localeKey, actionData] of Object.entries(innerObj)) {
      innerMap.set(localeKey, actionData);
    }
    releaseVersionMap.set(entryId, innerMap);
  }

  return {
    releaseVersionMap,
    locales: parsedRaw.locales,
    activeRelease: parsedRaw.activeRelease,
    isActiveReleaseLoading: parsedRaw.isActiveReleaseLoading,
    releases: parsedRaw.releases,
  };
}
