import * as React from 'react';
import constate from 'constate';
function useSdk({ sdk }) {
    const sdkMemo = React.useMemo(()=>sdk, [
        sdk.parameters.instance.release,
        sdk.field.validations
    ]);
    return sdkMemo;
}
export const [SdkProvider, useSdkContext] = constate(useSdk);
