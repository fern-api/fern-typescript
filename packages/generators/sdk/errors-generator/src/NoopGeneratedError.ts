import { GeneratedError } from "@fern-typescript/sdk-declaration-handler";

export class NoopGeneratedError implements GeneratedError {
    public writeToFile(): void {
        // no-op
    }
}
