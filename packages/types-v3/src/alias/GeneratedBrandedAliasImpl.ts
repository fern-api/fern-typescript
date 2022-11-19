import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { GeneratedAliasType } from "./GeneratedAliasType";

export abstract class GeneratedBrandedAliasImpl implements GeneratedAliasType {
    public writeDeclarationToFile(file: SdkFile): void {
        this.writeTypeAlias(file);
        this.writeConst(file);
    }

    private writeTypeAlias(file: SdkFile) {
        const referenceToAliasedType = file.getReferenceToType(this.shape.aliasOf).typeNode;
        const typeAlias = file.sourceFile.addTypeAlias({
            name: this.typeName,
            type: getTextOfTsNode(
                ts.factory.createIntersectionTypeNode([
                    referenceToAliasedType,
                    ts.factory.createTypeLiteralNode([
                        ts.factory.createPropertySignature(
                            undefined,
                            this.getStringBrand(),
                            undefined,
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                        ),
                    ]),
                ])
            ),
            isExported: true,
        });
        maybeAddDocs(typeAlias, this.typeDeclaration.docs);
    }

    private writeConst(file: SdkFile) {
        const VALUE_PARAMETER_NAME = "value";
        file.sourceFile.addFunction({
            name: this.typeName,
            parameters: [
                {
                    name: VALUE_PARAMETER_NAME,
                    type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
                },
            ],
            returnType: getTextOfTsNode(this.getReferenceToParsedShape(file)),
            statements: [
                getTextOfTsNode(
                    ts.factory.createReturnStatement(
                        ts.factory.createAsExpression(
                            ts.factory.createAsExpression(
                                ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                            ),
                            this.getReferenceToParsedShape(file)
                        )
                    )
                ),
            ],
            isExported: true,
        });
    }

    public writeSchemaToFile(file: SdkFile): void {
        const VALUE_PARAMETER_NAME = "value";
        file.getSchemaOfTypeReference(this.shape.aliasOf).transform({
            newShape: undefined,
            parse: this.getAliasCreator(file),
            json: ts.factory.createArrowFunction(
                undefined,
                undefined,
                [
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        VALUE_PARAMETER_NAME,
                        undefined,
                        undefined
                    ),
                ],
                undefined,
                undefined,
                ts.factory.createIdentifier(VALUE_PARAMETER_NAME)
            ),
        });
    }

    private getStringBrand(): string {
        return [
            ...this.typeDeclaration.name.fernFilepathV2.slice(0, -1).map((part) => part.unsafeName.camelCase),
            this.typeName,
        ].join("_");
    }
}
