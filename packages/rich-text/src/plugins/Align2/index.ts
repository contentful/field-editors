import { RichTextPlugin } from "types";
import { KEY_ALIGN } from "@udecode/plate-alignment";
import { createCenterPlugin } from "./Center";

export const createAlignPlugin = (): RichTextPlugin => ({
    key: KEY_ALIGN,
    plugins: [createCenterPlugin()]
});