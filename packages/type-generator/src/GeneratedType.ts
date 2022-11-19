import { ModelContext } from "@fern-typescript/sdk-declaration-handler";

export interface GeneratedType {
    writeToFile: (context: ModelContext) => void;
}
