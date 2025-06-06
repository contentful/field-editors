import type { CollectionProp } from 'contentful-management/types';
import { compareAsc } from 'date-fns';

import type {
  ReleaseAction,
  ReleaseV2Entity,
  ReleaseV2EntityWithLocales,
  ReleaseV2Props,
} from '../types';

export function getPreviousReleaseEntryVersion({
  entryId,
  releaseVersionMap,
  activeRelease,
  releases,
}: {
  entryId: string;
  releaseVersionMap: Map<string, Map<string, ReleaseAction>>;
  activeRelease: ReleaseV2Props | undefined;
  releases: CollectionProp<ReleaseV2Props> | undefined;
}): {
  previousReleaseEntity: ReleaseV2Entity | ReleaseV2EntityWithLocales | undefined;
  previousRelease: ReleaseV2Props | undefined;
} {
  const orderedScheduledReleases = releases?.items
    .filter((r) => r.startDate)
    .sort((a, b) => compareAsc(new Date(a.startDate!), new Date(b.startDate!)));

  const indexOfActive = orderedScheduledReleases?.findIndex(
    (r) => r.sys.id === activeRelease?.sys.id,
  );

  let previousRelease: ReleaseV2Props | undefined;
  let previousReleaseEntity: ReleaseV2Entity | ReleaseV2EntityWithLocales | undefined;

  if (indexOfActive && indexOfActive > 0) {
    for (let i = indexOfActive - 1; i >= 0; i--) {
      const release = orderedScheduledReleases![i];
      const action = releaseVersionMap.get(entryId)?.get(release.sys.id);
      if (action !== 'not-in-release') {
        previousRelease = release;
        previousReleaseEntity = release.entities.items.find((e) => e.entity.sys.id === entryId);
        break;
      }
    }
  }
  return { previousRelease, previousReleaseEntity };
}
