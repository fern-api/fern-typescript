import { ModelContext } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export interface UnknownSingleUnionType {
    discriminantType: ts.TypeNode;
    getVisitorArgument: (context: ModelContext) => ts.TypeNode;
    getNonDiscriminantProperties?: (context: ModelContext) => OptionalKind<PropertySignatureStructure>[];
}
