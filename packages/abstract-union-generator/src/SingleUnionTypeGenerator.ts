import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export interface SingleUnionTypeGenerator {
    getExtendsForInterface(file: SdkFile): ts.TypeNode[];
    getNonDiscriminantPropertiesForInterface(file: SdkFile): OptionalKind<PropertySignatureStructure>[];
    getVisitorArguments(args: { localReferenceToUnionValue: ts.Expression }): ts.Expression[];
    getVisitMethodParameterType(file: SdkFile): ts.TypeNode | undefined;
    getParametersForBuilder(file: SdkFile): ts.ParameterDeclaration[];
    getNonDiscriminantPropertiesForBuilder(file: SdkFile): ts.ObjectLiteralElementLike[];
}
