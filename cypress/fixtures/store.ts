import { MRActions } from 'contentful-management';
import { get, set, cloneDeep } from 'lodash-es';

import {
  assets,
  contentTypes,
  entries,
  locales as localesFixtures,
  spaces,
} from '../../packages/reference/src/__fixtures__/fixtures';

type EntityType = keyof Omit<MRActions, 'Http'>;

export interface Store {
  set<E = unknown>(entityType: EntityType, entityId: string, entity: E): void;

  get<E = unknown>(entityType: EntityType, entityId: string): E;
  getAll<E = unknown>(entityType: EntityType): E[];
}

type InMemoryStoreData = Partial<Record<EntityType, Record<string, unknown>>>;

export class InMemoryStore implements Store {
  private data: InMemoryStoreData;

  constructor(data: InMemoryStoreData = {}) {
    this.data = cloneDeep(data);
  }

  get<E = unknown>(entityType: EntityType, entityId: string): E {
    const entity = get(this.data, [entityType, entityId]);

    if (!entity) {
      throw new Error();
    }

    return entity;
  }

  getAll<E = unknown>(entityType: EntityType): E[] {
    const entities = get(this.data, [entityType]);

    if (!entities) {
      throw new Error();
    }

    return Object.values(entities) as E[];
  }

  set<E = unknown>(entityType: EntityType, entityId: string, entity: E): void {
    set(this.data, [entityType, entityId], cloneDeep(entity));
  }
}

export function createDefaultFakeStore(): Store {
  return new InMemoryStore({
    Entry: {
      [entries.empty.sys.id]: entries.empty,
      [entries.published.sys.id]: entries.published,
      [entries.changed.sys.id]: entries.changed,
    },
    Asset: {
      [assets.empty.sys.id]: assets.empty,
      [assets.published.sys.id]: assets.published,
      [assets.changed.sys.id]: assets.changed,
    },
    Space: {
      [spaces.indifferent.sys.id]: spaces.indifferent,
    },
    ContentType: {
      [contentTypes.published.sys.id]: contentTypes.published,
    },
    Locale: {
      [localesFixtures.englishDefault.sys.id]: localesFixtures.englishDefault,
      [localesFixtures.german.sys.id]: localesFixtures.german,
    },
  });
}
