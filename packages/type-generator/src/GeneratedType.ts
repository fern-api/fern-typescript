import { TypeContext } from "@fern-typescript/sdk-declaration-handler";

export interface GeneratedType {
    writeToFile: (context: TypeContext) => void;
}
