import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-model/types";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { GeneratedEnumType } from "./GeneratedEnumType";

export declare namespace GeneratedEnumTypeImpl {
    export interface Init {
        typeDeclaration: TypeDeclaration;
        shape: EnumTypeDeclaration;
    }
}

export class GeneratedEnumTypeImpl implements GeneratedEnumType {
    private typeDeclaration: TypeDeclaration;
    private shape: EnumTypeDeclaration;

    constructor({ typeDeclaration, shape }: GeneratedEnumTypeImpl.Init) {
        this.typeDeclaration = typeDeclaration;
        this.shape = shape;
    }

    public writeDeclarationToFile(file: SdkFile): void {}
    public writeSchemaToFile(file: SdkFile): void {}
}
