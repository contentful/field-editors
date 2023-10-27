import { FieldAPI } from '@contentful/app-sdk';
import type { Emitter, Handler } from 'mitt';
import mitt from 'mitt';

function identity<T>(item: T): T {
  return item;
}

type CustomizeMockFn = (fieldApi: FieldAPI) => FieldAPI;

export function createFakeFieldAPI<T>(
  customizeMock: CustomizeMockFn = identity,
  initialValue?: T
): [FieldAPI, Emitter] {
  // @ts-expect-error -- TODO: describe this error
  const emitter: Emitter = mitt();

  // eslint-disable-next-line -- TODO: describe this disable
  let _value: any = initialValue;

  return [
    customizeMock({
      id: 'fake-id',
      name: 'My field',
      locale: 'en-US',
      type: 'Symbol',
      validations: [],
      required: false,
      getIsDisabled: () => false,
      getSchemaErrors: () => [],
      onValueChanged: (...args: [string, Function] | [Function]) => {
        let fn: Function;
        if (typeof args[0] === 'string') {
          fn = args[1] as Function;
        } else {
          fn = args[0];
        }
        emitter.on('onValueChanged', fn as Handler);
        return () => {
          emitter.off('onValueChanged', fn as Handler);
        };
      },
      onIsDisabledChanged: (fn: Function) => {
        emitter.on('onIsDisabledChanged', fn as Handler);
        return () => {
          emitter.off('onIsDisabledChanged', fn as Handler);
        };
      },
      onSchemaErrorsChanged: (fn: Function) => {
        emitter.on('onSchemaErrorsChanged', fn as Handler);
        return () => {
          emitter.off('onSchemaErrorsChanged', fn as Handler);
        };
      },
      getValue: () => {
        emitter.emit('getValue');
        return _value;
      },
      setInvalid: () => {
        emitter.emit('setInvalid');
      },
      setValue: (value) => {
        _value = value;
        emitter.emit('setValue', _value);
        emitter.emit('onValueChanged', _value);
        return Promise.resolve(undefined);
      },
      removeValue: () => {
        _value = undefined;
        emitter.emit('removeValue');
        emitter.emit('onValueChanged', undefined);
        return Promise.resolve();
      },
    }),
    emitter,
  ];
}
