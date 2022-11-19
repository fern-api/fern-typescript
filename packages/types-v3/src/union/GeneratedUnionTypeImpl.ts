import { UnionTypeDeclaration } from "@fern-fern/ir-model/types";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { AbstractParsedSingleUnionType, UnionGenerator } from "@fern-typescript/union-generator";
import { ts } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";
import { GeneratedUnionType } from "./GeneratedUnionType";
import { ParsedSingleUnionTypeForUnion } from "./ParsedSingleUnionTypeForUnion";

export class GeneratedUnionTypeImpl extends AbstractGeneratedType<UnionTypeDeclaration> implements GeneratedUnionType {
    private unionGenerator: UnionGenerator;

    constructor(superInit: AbstractGeneratedType.Init<UnionTypeDeclaration>) {
        super(superInit);

        const parsedSingleUnionTypes = this.shape.types.map(
            (singleUnionType) => new ParsedSingleUnionTypeForUnion({ singleUnionType, union: this.shape })
        );

        this.unionGenerator = new UnionGenerator({
            typeName: this.typeName,
            getReferenceToUnion: this.getReferenceToSelf.bind(this),
            docs: this.typeDeclaration.docs,
            discriminant: this.shape.discriminantV2,
            parsedSingleUnionTypes,
            unknownSingleUnionType: {
                discriminantType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
                getVisitorArgument: () =>
                    ts.factory.createTypeLiteralNode([
                        ts.factory.createPropertySignature(
                            undefined,
                            ts.factory.createIdentifier(
                                AbstractParsedSingleUnionType.getDiscriminantKey(this.shape.discriminantV2)
                            ),
                            undefined,
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                        ),
                    ]),
            },
        });
    }

    public writeToFile(file: SdkFile): void {
        this.unionGenerator.writeToFile(file);
    }
}
