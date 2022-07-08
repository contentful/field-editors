import { Adapter, MRActions, MROpts } from 'contentful-management';
import { Except, PartialDeep } from 'type-fest';

type Options<ET extends keyof MRActions, A extends keyof MRActions[ET]> = Except<
  MROpts<ET, A>,
  'entityType' | 'action'
>;
type Params<ET extends keyof MRActions, A extends keyof MRActions[ET]> =
  'params' extends keyof Options<ET, A> ? Options<ET, A>['params'] : {};
type Return<ET extends keyof MRActions, Action extends keyof MRActions[ET]> =
  'return' extends keyof MRActions[ET][Action]
    ? Promise<PartialDeep<MRActions[ET][Action]['return']>>
    : never;

type Overrides = PartialDeep<
  {
    [EntityType in keyof MRActions]: {
      [Action in keyof MRActions[EntityType]]: (
        params: Params<EntityType, Action>
      ) => Return<EntityType, Action>;
    };
  }
>;

export function createFakeCMAAdapter(overrides?: Overrides) {
  function makeRequest({
    entityType,
    action,
    params,
  }: {
    entityType: string;
    action: string;
    params: unknown;
  }) {
    return (
      // @ts-expect-error
      overrides?.[entityType]?.[action]?.(params) ??
      Promise.reject(`Override for ${entityType}.${action} is not defined`)
    );
  }

  return { makeRequest } as Adapter;
}
