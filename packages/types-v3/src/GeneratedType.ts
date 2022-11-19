import { SdkFile } from "@fern-typescript/sdk-declaration-handler";

export interface GeneratedType {
    writeToFile: (file: SdkFile) => void;
}
