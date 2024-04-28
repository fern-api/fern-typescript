/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as errors from "../../../../errors";

export class SnippetNotFound extends errors.FernInternalError {
    constructor(body: string) {
        super({
            message: "SnippetNotFound",
            statusCode: 404,
            body: body,
        });
        Object.setPrototypeOf(this, SnippetNotFound.prototype);
    }
}
