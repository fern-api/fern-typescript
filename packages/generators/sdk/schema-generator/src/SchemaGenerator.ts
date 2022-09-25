import { EnumTypeDeclaration, Type, TypeDeclaration, TypeReference } from "@fern-fern/ir-model/types";
import { SdkDeclarationHandler, Zurg } from "@fern-typescript/sdk-declaration-handler";

export const SchemaGenerator: SdkDeclarationHandler<TypeDeclaration> = {
    run: async (typeDeclaration, { file, exportedName }) => {
        const schema = Type._visit<Zurg.Schema>(typeDeclaration.shape, {
            object: (objectTypeDeclaration) => {
                let schema = file.coreUtilities.zurg.object([]);
                for (const extension of objectTypeDeclaration.extends) {
                    schema = schema.extend(file.getReferenceToSchema(extension));
                }
                return schema;
            },
            union: (unionTypeDeclaration) => {
                let schema = file.coreUtilities.zurg.union([]);
                schema = schema.withProperties([
                    {
                        key: "_visit",
                        getValue: ({ getReferenceToParsed }) => {},
                    },
                ]);
                return schema;
            },
            alias: (aliasTypeDeclaration) => {
                return TypeReference._visit(aliasTypeDeclaration.aliasOf, {});
            },
            enum: (enumTypeDeclaration: EnumTypeDeclaration) => {
                return file.coreUtilities.zurg.enum([]);
            },
            _unknown: () => {
                throw new Error("Unknown declaration type: " + typeDeclaration.shape._type);
            },
        });

        const schemaNamespace = file.sourceFile.addVariableStatement({
            isExported: true,
            declarations: [
                {
                    name: exportedName,
                    initializer: getTextOfTsNode(schema.toExpression()),
                },
            ],
        });

        schemaNamespace.add;
    },
};
