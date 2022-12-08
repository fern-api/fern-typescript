import { ObjectProperty } from "@fern-fern/ir-model/types";
import { BaseGeneratedType } from "./BaseGeneratedType";

export interface GeneratedObjectType<Context> extends BaseGeneratedType<Context> {
    type: "object";
    getPropertyKey: (property: ObjectProperty) => string;
}
