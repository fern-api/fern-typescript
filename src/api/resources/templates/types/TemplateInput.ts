/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernInternal from "../../..";

export type TemplateInput = FernInternal.TemplateInput.Template | FernInternal.TemplateInput.Payload;

export declare namespace TemplateInput {
    interface Template {
        type: "template";
        value: FernInternal.Template;
    }

    interface Payload extends FernInternal.PayloadInput {
        type: "payload";
    }
}
