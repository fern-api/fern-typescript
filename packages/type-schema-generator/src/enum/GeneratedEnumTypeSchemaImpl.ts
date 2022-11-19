import { EnumTypeDeclaration } from "@fern-fern/ir-model/types";
import { GeneratedEnumTypeSchema, TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";
import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema";

export class GeneratedEnumTypeSchemaImpl
    extends AbstractGeneratedTypeSchema<EnumTypeDeclaration>
    implements GeneratedEnumTypeSchema
{
    public writeToFile(context: TypeSchemaContext): void {}
}
