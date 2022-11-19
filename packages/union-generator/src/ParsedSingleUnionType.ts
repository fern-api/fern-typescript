import { TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { UnionGenerator } from "./UnionGenerator";

export interface ParsedSingleUnionType {
    getDocs(): string | null | undefined;
    getDiscriminantValue(): string;
    getInterfaceName(): string;
    getInterfaceDeclaration(context: TypeContext): ParsedSingleUnionType.InterfaceDeclaration;
    getBuilder(context: TypeContext, UnionGenerator: UnionGenerator): ts.ArrowFunction;
    getBuilderName(): string;
    getVisitMethod(args: { localReferenceToUnionValue: ts.Expression }): ts.ArrowFunction;
    getVisitMethodSignature(context: TypeContext): ts.FunctionTypeNode;
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
