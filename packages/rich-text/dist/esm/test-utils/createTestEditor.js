import { normalize, createPlateEditor } from '../internal';
import { getPlugins } from '../plugins';
import { randomId } from './randomId';
export const createTestEditor = (options)=>{
    const trackingHandler = options.trackingHandler ?? jest.fn();
    const sdk = options.sdk ?? {
        field: {
            validation: []
        }
    };
    const editor = createPlateEditor({
        id: randomId('editor'),
        editor: options.input,
        plugins: options.plugins || getPlugins(sdk, trackingHandler),
        normalizeInitialValue: false
    });
    return {
        editor: editor,
        normalize: ()=>normalize(editor)
    };
};
