import mitt from 'mitt';
import { FieldAPI } from 'contentful-ui-extensions-sdk';

function identity<T>(item: T): T {
  return item;
}

type CustomizeMockFn = (fieldApi: FieldAPI) => FieldAPI;

export function createFakeFieldAPI<T>(
  customizeMock: CustomizeMockFn = identity,
  initialValue?: T
): [FieldAPI, mitt.Emitter] {
  const emitter: mitt.Emitter = mitt();

  // eslint-disable-next-line
  let _value: any = initialValue;

  return [
    customizeMock({
      id: 'fake-id',
      locale: 'en-US',
      type: '',
      validations: [],
      required: false,
      onValueChanged: (fn: Function) => {
        emitter.on('onValueChanged', fn as mitt.Handler);
        return () => {
          emitter.off('onValueChanged', fn as mitt.Handler);
        };
      },
      onIsDisabledChanged: (fn: Function) => {
        emitter.on('onIsDisabledChanged', fn as mitt.Handler);
        return () => {
          emitter.off('onIsDisabledChanged', fn as mitt.Handler);
        };
      },
      onSchemaErrorsChanged: (fn: Function) => {
        emitter.on('onSchemaErrorsChanged', fn as mitt.Handler);
        return () => {
          emitter.off('onSchemaErrorsChanged', fn as mitt.Handler);
        };
      },
      getValue: () => {
        emitter.emit('getValue');
        return _value;
      },
      setInvalid: () => {
        emitter.emit('setInvalid');
      },
      setValue: (value: string) => {
        _value = value;
        emitter.emit('setValue', _value);
        emitter.emit('onValueChanged', _value);
        return Promise.resolve();
      },
      removeValue: () => {
        _value = undefined;
        emitter.emit('removeValue');
        emitter.emit('onValueChanged', undefined);
        return Promise.resolve();
      }
    }),
    emitter
  ];
}
