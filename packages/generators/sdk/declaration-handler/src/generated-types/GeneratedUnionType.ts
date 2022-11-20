import { SingleUnionTypeProperty } from "@fern-fern/ir-model/types";
import { GeneratedUnion } from "../GeneratedUnion";
import { TypeContext } from "../TypeContext";
import { GeneratedType } from "./GeneratedType";

export interface GeneratedUnionType extends GeneratedType {
    getGeneratedUnion: () => GeneratedUnion<TypeContext>;
    getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string;
}
