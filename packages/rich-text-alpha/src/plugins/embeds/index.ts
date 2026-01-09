import type { FieldAppSDK } from '@contentful/app-sdk';

import { EmbeddedEntity } from './inline';

export const embeds = (sdk: FieldAppSDK) => [new EmbeddedEntity(sdk)];
