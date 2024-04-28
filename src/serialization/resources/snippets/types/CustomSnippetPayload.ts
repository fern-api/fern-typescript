/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../..";
import * as Fern from "../../../../api";
import * as core from "../../../../core";
import { ParameterPayload } from "./ParameterPayload";

export const CustomSnippetPayload: core.serialization.ObjectSchema<
    serializers.CustomSnippetPayload.Raw,
    Fern.CustomSnippetPayload
> = core.serialization.object({
    headers: core.serialization.list(ParameterPayload).optional(),
    pathParameters: core.serialization.list(ParameterPayload).optional(),
    queryParameters: core.serialization.list(ParameterPayload).optional(),
    requestBody: core.serialization.unknown().optional(),
});

export declare namespace CustomSnippetPayload {
    interface Raw {
        headers?: ParameterPayload.Raw[] | null;
        pathParameters?: ParameterPayload.Raw[] | null;
        queryParameters?: ParameterPayload.Raw[] | null;
        requestBody?: unknown | null;
    }
}
