import { AliasTypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsKeyword, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";
import { GeneratedAliasType } from "./GeneratedAliasType";

export class GeneratedAliasTypeImpl extends AbstractGeneratedType<AliasTypeDeclaration> implements GeneratedAliasType {
    public writeToFile(file: SdkFile): void {
        this.writeTypeAlias(file);
        this.writeConst(file);
    }

    private writeTypeAlias(file: SdkFile) {
        const typeAlias = file.sourceFile.addTypeAlias({
            name: this.typeName,
            type: getTextOfTsNode(file.getReferenceToType(this.shape.aliasOf).typeNode),
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
            returnType: getTextOfTsNode(this.getReferenceToSelf(file).getTypeNode()),
            statements: [
                getTextOfTsNode(
                    ts.factory.createReturnStatement(
                        ts.factory.createAsExpression(
                            ts.factory.createAsExpression(
                                ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                            ),
                            this.getReferenceToSelf(file).getTypeNode()
                        )
                    )
                ),
            ],
            isExported: true,
        });
    }
}
