/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../..";
import * as Fern from "../../../../api";
import * as core from "../../../../core";

export const GoSdk: core.serialization.ObjectSchema<serializers.GoSdk.Raw, Fern.GoSdk> = core.serialization.object({
    githubRepo: core.serialization.string(),
    version: core.serialization.string(),
});

export declare namespace GoSdk {
    interface Raw {
        githubRepo: string;
        version: string;
    }
}
