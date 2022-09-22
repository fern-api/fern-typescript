import { TypeReference } from "@fern-fern/ir-model/types";
import { File, TypeReferenceNode } from "@fern-typescript/sdk-declaration-handler";

export function getReferenceToMaybeVoidType(reference: TypeReference, file: File): TypeReferenceNode | undefined {
    if (reference._type === "void") {
        return undefined;
    }
    return file.getReferenceToType(reference);
}
