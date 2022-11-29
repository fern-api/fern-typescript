import { DeclaredTypeName, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode, Zurg } from "@fern-typescript/commons-v2";
import { GeneratedTypeSchema } from "../../generated-types";
import { Reference } from "../../Reference";
import { TypeSchemaContext } from "../TypeSchemaContext";

export interface TypeSchemaReferencingContextMixin {
    getGeneratedTypeSchema: (typeName: DeclaredTypeName) => GeneratedTypeSchema<TypeSchemaContext>;
    getReferenceToRawType: (typeReference: TypeReference) => TypeReferenceNode;
    getReferenceToRawNamedType: (typeName: DeclaredTypeName) => Reference;
    getSchemaOfTypeReference: (typeReference: TypeReference) => Zurg.Schema;
    getSchemaOfNamedType: (typeName: DeclaredTypeName) => Zurg.Schema;
}
