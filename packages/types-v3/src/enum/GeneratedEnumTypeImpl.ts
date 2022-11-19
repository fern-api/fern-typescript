import { EnumTypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, getWriterForMultiLineUnionType, maybeAddDocs } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts, VariableDeclarationKind } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";
import { GeneratedEnumType } from "./GeneratedEnumType";

export class GeneratedEnumTypeImpl extends AbstractGeneratedType<EnumTypeDeclaration> implements GeneratedEnumType {
    public writeToFile(file: SdkFile): void {
        const type = file.sourceFile.addTypeAlias({
            name: this.typeName,
            isExported: true,
            type: getWriterForMultiLineUnionType(
                this.shape.values.map((value) => ({
                    docs: value.docs,
                    node: ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value.nameV2.wireValue)),
                }))
            ),
        });

        maybeAddDocs(type, this.typeDeclaration.docs);

        file.sourceFile.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            declarations: [
                {
                    name: this.typeName,
                    initializer: getTextOfTsNode(
                        ts.factory.createAsExpression(
                            ts.factory.createObjectLiteralExpression(
                                this.shape.values.map((value) =>
                                    ts.factory.createPropertyAssignment(
                                        ts.factory.createIdentifier(value.nameV2.name.unsafeName.pascalCase),
                                        ts.factory.createStringLiteral(value.nameV2.wireValue)
                                    )
                                ),
                                true
                            ),
                            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("const"))
                        )
                    ),
                },
            ],
        });
    }
}
