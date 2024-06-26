/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as Fern from "../../../index";

export type AuthPayload = Fern.AuthPayload.Bearer | Fern.AuthPayload.Basic;

export declare namespace AuthPayload {
    interface Bearer extends Fern.BearerTokenAuthPayload {
        type: "bearer";
    }

    interface Basic extends Fern.BasicAuthPayload {
        type: "basic";
    }
}
