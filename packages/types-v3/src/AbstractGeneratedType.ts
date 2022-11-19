import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { GeneratedType } from "./GeneratedType";

export declare namespace AbstractGeneratedType {
    export interface Init {
        typeName: string;
    }
}

export abstract class AbstractGeneratedType implements GeneratedType {
    protected typeName: string;

    constructor({ typeName }: AbstractGeneratedType.Init) {
        this.typeName = typeName;
    }

    public writeSchemaToFile(file: SdkFile): void {}

    protected abstract getReferenceToRawShape(file: SdkFile): ts.TypeNode;
    protected abstract getReferenceToParsedShape(file: SdkFile): ts.TypeNode;
    protected abstract getSchema(file: SdkFile): Zurg.Schema;
    protected abstract generateRawTypeDeclaration(file: SdkFile, module: ModuleDeclaration): void;
}
