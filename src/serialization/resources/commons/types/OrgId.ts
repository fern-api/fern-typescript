/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../..";
import * as Fern from "../../../../api";
import * as core from "../../../../core";

export const OrgId: core.serialization.Schema<serializers.OrgId.Raw, Fern.OrgId> = core.serialization.string();

export declare namespace OrgId {
    type Raw = string;
}
