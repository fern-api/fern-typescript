import { SdkFile } from "@fern-typescript/sdk-declaration-handler";

export interface GeneratedType {
    writeDeclarationToFile: (file: SdkFile) => void;
    writeSchemaToFile: (file: SdkFile) => void;
}
