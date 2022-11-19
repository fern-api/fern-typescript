import { AliasTypeDeclaration } from "@fern-fern/ir-model/types";
import { GeneratedAliasTypeSchema, TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";
import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema";

export class GeneratedAliasTypeSchemaImpl
    extends AbstractGeneratedTypeSchema<AliasTypeDeclaration>
    implements GeneratedAliasTypeSchema
{
    public writeToFile(context: TypeSchemaContext): void {}
}
