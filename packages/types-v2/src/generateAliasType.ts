import { AliasTypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { VariableDeclarationKind } from "ts-morph";
import { getSchemaFromTypeReference } from "./getSchemaFromTypeReference";

export function generateAliasType({
    typeFile,
    schemaFile,
    typeName,
    docs,
    shape,
}: {
    typeFile: SdkFile;
    schemaFile: SdkFile;
    typeName: string;
    docs: string | null | undefined;
    shape: AliasTypeDeclaration;
}): void {
    const typeAlias = typeFile.sourceFile.addTypeAlias({
        name: typeName,
        type: getTextOfTsNode(typeFile.getReferenceToType(shape.aliasOf).typeNode),
        isExported: true,
    });
    maybeAddDocs(typeAlias, docs);

    schemaFile.sourceFile.addVariableStatement({
        isExported: true,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: typeName,
                initializer: getTextOfTsNode(getSchemaFromTypeReference(shape.aliasOf, schemaFile).toExpression()),
            },
        ],
    });
}
