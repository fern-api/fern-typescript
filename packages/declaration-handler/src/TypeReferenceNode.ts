import { ts } from "ts-morph";

export interface TypeReferenceNode {
    typeNode: ts.TypeNode;
    isOptional: boolean;
}
