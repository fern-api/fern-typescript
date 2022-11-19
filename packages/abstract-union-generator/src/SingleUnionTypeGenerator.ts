import { ModelContext } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export interface SingleUnionTypeGenerator {
    getExtendsForInterface(context: ModelContext): ts.TypeNode[];
    getNonDiscriminantPropertiesForInterface(context: ModelContext): OptionalKind<PropertySignatureStructure>[];
    getVisitorArguments(args: { localReferenceToUnionValue: ts.Expression }): ts.Expression[];
    getVisitMethodParameterType(context: ModelContext): ts.TypeNode | undefined;
    getParametersForBuilder(context: ModelContext): ts.ParameterDeclaration[];
    getNonDiscriminantPropertiesForBuilder(context: ModelContext): ts.ObjectLiteralElementLike[];
}
