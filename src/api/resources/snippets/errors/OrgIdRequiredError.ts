/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as errors from "../../../../errors/index";

export class OrgIdRequiredError extends errors.FernError {
    constructor(body: string) {
        super({
            message: "OrgIdRequiredError",
            statusCode: 400,
            body: body,
        });
        Object.setPrototypeOf(this, OrgIdRequiredError.prototype);
    }
}
