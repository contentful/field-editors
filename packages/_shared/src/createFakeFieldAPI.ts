import mitt from 'mitt';
import { FieldAPI } from 'contentful-ui-extensions-sdk';

function identity<T>(item: T): T {
  return item;
}

type CustomizeMockFn = (fieldApi: FieldAPI, emitter: mitt.Emitter) => FieldAPI;

export function createFakeFieldAPI<T>(
  customizeMock: CustomizeMockFn = identity,
  initialValue?: T
): FieldAPI {
  const emitter: mitt.Emitter = new mitt();

  // eslint-disable-next-line
  let _value: any = initialValue;

  return customizeMock(
    {
      id: 'fake-id',
      locale: 'en-US',
      type: '',
      validations: [],
      required: false,
      onValueChanged: (fn: Function) => {
        emitter.on('value_changed', fn as mitt.Handler);
        return () => {
          emitter.off('value_changed', fn as mitt.Handler);
        };
      },
      onIsDisabledChanged: (fn: Function) => {
        emitter.on('disable_changed', fn as mitt.Handler);
        return () => {
          emitter.off('disable_changed', fn as mitt.Handler);
        };
      },
      onSchemaErrorsChanged: (fn: Function) => {
        emitter.on('errors_changed', fn as mitt.Handler);
        return () => {
          emitter.off('errors_changed', fn as mitt.Handler);
        };
      },
      getValue: () => _value,
      setInvalid: () => {},
      setValue: (value: string) => {
        _value = value;
        emitter.emit('value_changed', _value);
        return Promise.resolve();
      },
      removeValue: () => {
        _value = '';
        emitter.emit('value_changed', '');
        return Promise.resolve();
      }
    },
    emitter
  );
}
