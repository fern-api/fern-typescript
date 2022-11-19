import { ObjectTypeDeclaration } from "@fern-fern/ir-model/types";
import { GeneratedObjectTypeSchema, TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";
import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema";

export class GeneratedObjectTypeSchemaImpl
    extends AbstractGeneratedTypeSchema<ObjectTypeDeclaration>
    implements GeneratedObjectTypeSchema
{
    public writeToFile(context: TypeSchemaContext): void {}
}
