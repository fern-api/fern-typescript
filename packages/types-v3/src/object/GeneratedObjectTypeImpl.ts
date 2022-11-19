import { ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-model/types";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { GeneratedObjectType } from "./GeneratedObjectType";

export declare namespace GeneratedObjectTypeImpl {
    export interface Init {
        typeDeclaration: TypeDeclaration;
        shape: ObjectTypeDeclaration;
    }
}

export class GeneratedObjectTypeImpl implements GeneratedObjectType {
    private typeDeclaration: TypeDeclaration;
    private shape: ObjectTypeDeclaration;

    constructor({ typeDeclaration, shape }: GeneratedObjectTypeImpl.Init) {
        this.typeDeclaration = typeDeclaration;
        this.shape = shape;
    }

    public writeDeclarationToFile(file: SdkFile): void {}
    public writeSchemaToFile(file: SdkFile): void {}
}
