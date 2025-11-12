import React from 'react';
import tokens from '@contentful/f36-tokens';
import { CharValidation, ConstraintsUtils } from '@contentful/field-editor-shared';
import { css, cx } from 'emotion';
import { usePlateEditorState } from './internal/hooks';
import { useSdkContext } from './SdkProvider';
const styles = {
    container: css({
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: tokens.fontSizeM,
        marginTop: tokens.spacingXs,
        color: tokens.gray700
    }),
    counterInvalid: css({
        color: tokens.red600
    })
};
function CharCounter({ checkConstraints }) {
    const editor = usePlateEditorState();
    const count = editor.getCharacterCount();
    const valid = checkConstraints(count);
    return /*#__PURE__*/ React.createElement("span", {
        className: cx({
            [styles.counterInvalid]: !valid
        })
    }, count, " characters");
}
export function CharConstraints() {
    const sdk = useSdkContext();
    const { constraints, checkConstraints } = React.useMemo(()=>{
        const constraints = ConstraintsUtils.fromFieldValidations(sdk.field.validations, 'RichText');
        const checkConstraints = ConstraintsUtils.makeChecker(constraints);
        return {
            constraints,
            checkConstraints
        };
    }, [
        sdk.field.validations
    ]);
    return /*#__PURE__*/ React.createElement("div", {
        className: styles.container
    }, /*#__PURE__*/ React.createElement(CharCounter, {
        checkConstraints: checkConstraints
    }), /*#__PURE__*/ React.createElement(CharValidation, {
        constraints: constraints
    }));
}
