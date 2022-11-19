import { UnionTypeDeclaration } from "@fern-fern/ir-model/types";
import { AbstractGeneratedType } from "../AbstractGeneratedType";
import { GeneratedUnionType } from "./GeneratedUnionType";

export class GeneratedUnionTypeImpl extends AbstractGeneratedType<UnionTypeDeclaration> implements GeneratedUnionType {
    public writeToFile(): void {
        // no-op
    }
}
