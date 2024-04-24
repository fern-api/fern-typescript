/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "..";
import * as Fern from "../../api";
import * as core from "../../core";
import { Snippet } from "../types/Snippet";

export const Response: core.serialization.Schema<serializers.get.Response.Raw, Fern.Snippet[]> =
    core.serialization.list(Snippet);

export declare namespace Response {
    type Raw = Snippet.Raw[];
}
