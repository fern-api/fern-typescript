import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { UnionGenerator } from "./UnionGenerator";

export interface ParsedSingleUnionType {
    getDocs(): string | null | undefined;
    getDiscriminantValue(): string;
    getInterfaceName(): string;
    getInterfaceDeclaration(file: SdkFile): ParsedSingleUnionType.InterfaceDeclaration;
    getBuilder(file: SdkFile, UnionGenerator: UnionGenerator): ts.ArrowFunction;
    getBuilderName(): string;
    getVisitMethod(args: { localReferenceToUnionValue: ts.Expression }): ts.ArrowFunction;
    getVisitMethodSignature(file: SdkFile): ts.FunctionTypeNode;
    getVisitorKey(): string;
    invokeVisitMethod(args: {
        localReferenceToUnionValue: ts.Expression;
        localReferenceToVisitor: ts.Expression;
    }): ts.Expression;
}

export declare namespace ParsedSingleUnionType {
    export interface InterfaceDeclaration {
        name: string;
        extends: ts.TypeNode[];
        jsonProperties: OptionalKind<PropertySignatureStructure>[];
    }
}
