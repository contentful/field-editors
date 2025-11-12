import * as React from 'react';
import { Badge } from '@contentful/f36-components';
export const ResourceNewBadge = ()=>{
    return /*#__PURE__*/ React.createElement(React.Fragment, null, ' ', "(different space)", ' ', /*#__PURE__*/ React.createElement(Badge, {
        variant: "primary-filled",
        size: "small"
    }, "new"));
};
