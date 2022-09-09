import mitt from 'mitt';

export type PubsubFake = {
  send: (entityType: string, entityId: string, data: unknown) => void;
};

export type OnEntityChanged = (
  entityType: string,
  entityId: string,
  handler: (data: unknown) => void
) => void;

export function createFakePubsub(): [PubsubFake, OnEntityChanged] {
  const emitter = mitt();
  const pubsub: PubsubFake = {
    send: (entityType, entityId, data) =>
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
