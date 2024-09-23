import mitt from 'mitt';

export type PubsubEmitter = {
  entityChanged: (entityType: string, entityId: string, data: unknown) => void;
};

export type OnEntityChanged = (
  entityType: string,
  entityId: string,
  handler: (data: unknown) => void
) => void;

export function createFakePubsub(): [PubsubEmitter, OnEntityChanged] {
  const emitter = mitt();
  const pubsub: PubsubEmitter = {
    entityChanged: (entityType, entityId, data) =>
      emitter.emit(`entityChanged.${entityType}.${entityId}`, data),
  };

  const onEntityChanged: OnEntityChanged = (entityType, entityId, handler) => {
    const type = `entityChanged.${entityType}.${entityId}`;
    emitter.on(type, handler);

    return () => {
      emitter.off(type, handler);
    };
  };

  return [pubsub, onEntityChanged];
}
