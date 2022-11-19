import { TypeDeclaration, UnionTypeDeclaration } from "@fern-fern/ir-model/types";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { GeneratedUnionType } from "./GeneratedUnionType";

export declare namespace GeneratedUnionTypeImpl {
    export interface Init {
        typeDeclaration: TypeDeclaration;
        shape: UnionTypeDeclaration;
    }
}

export class GeneratedUnionTypeImpl implements GeneratedUnionType {
    private typeDeclaration: TypeDeclaration;
    private shape: UnionTypeDeclaration;

    constructor({ typeDeclaration, shape }: GeneratedUnionTypeImpl.Init) {
        this.typeDeclaration = typeDeclaration;
        this.shape = shape;
    }

    public writeDeclarationToFile(file: SdkFile): void {}
    public writeSchemaToFile(file: SdkFile): void {}
}
