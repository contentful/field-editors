import { FieldAPI } from '@contentful/app-sdk';
import mitt from 'mitt';
import type { Emitter, Handler } from 'mitt';

function identity<T>(item: T): T {
  return item;
}

type CustomizeMockFn = (fieldApi: FieldAPI) => FieldAPI;

export function createFakeFieldAPI<T>(
  customizeMock: CustomizeMockFn = identity,
  initialValue?: T
): [FieldAPI, Emitter] {
  const emitter: Emitter = mitt();

  // eslint-disable-next-line
  let _value: any = initialValue;

  return [
    customizeMock({
      id: 'fake-id',
      locale: 'en-US',
      type: 'Symbol',
      validations: [],
      required: false,
      onValueChanged: (...args: [string, Function] | [Function]) => {
        let fn: Function;
        if (typeof args[0] === 'string') {
          fn = args[1] as Function;
        } else {
          fn = args[0];
        }
        const handler: Handler = (value) => {
          _value = value;
          fn(value);
        };
        emitter.on('onValueChanged', handler);
        return () => {
          emitter.off('onValueChanged', handler);
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
