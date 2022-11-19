import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import {
    FernWriters,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
    ObjectWriter,
} from "@fern-typescript/commons";
import { Reference, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import {
    InterfaceDeclarationStructure,
    OptionalKind,
    PropertySignatureStructure,
    ts,
    VariableDeclarationKind,
} from "ts-morph";
import { AbstractParsedSingleUnionType } from "./AbstractParsedSingleUnionType";
import { ParsedSingleUnionType } from "./ParsedSingleUnionType";
import { UnknownSingleUnionType } from "./UnknownSingleUnionType";

export declare namespace UnionGenerator {
    export interface Init {
        typeName: string;
        discriminant: WireStringWithAllCasings;
        docs: string | null | undefined;
        parsedSingleUnionTypes: ParsedSingleUnionType[];
        unknownSingleUnionType: UnknownSingleUnionType;
        getReferenceToUnion: (file: SdkFile) => Reference;
    }
}

export class UnionGenerator {
    public static readonly UNKNOWN_SINGLE_UNION_TYPE_INTERFACE_NAME = "_Unknown";
    public static readonly UTILS_INTERFACE_NAME = "_Utils";
    public static readonly VISITOR_INTERFACE_NAME = "_Vistior";
    public static readonly VISITOR_RETURN_TYPE = "_Result";
    public static readonly VISITOR_PARAMETER_NAME = "visitor";
    public static readonly VISITEE_PARAMETER_NAME = "value";
    public static readonly UNKNOWN_VISITOR_KEY = "_other";
    public static readonly VISIT_UTIL_PROPERTY_NAME = "_visit";

    private discriminant: WireStringWithAllCasings;
    private docs: string | null | undefined;
    private typeName: string;
    private parsedSingleUnionTypes: ParsedSingleUnionType[];
    private unknownSingleUnionType: UnknownSingleUnionType;

    public readonly getReferenceToUnion: (file: SdkFile) => Reference;

    constructor({
        typeName,
        discriminant,
        docs,
        parsedSingleUnionTypes,
        unknownSingleUnionType,
        getReferenceToUnion,
    }: UnionGenerator.Init) {
        this.getReferenceToUnion = getReferenceToUnion;
        this.discriminant = discriminant;
        this.docs = docs;
        this.typeName = typeName;
        this.parsedSingleUnionTypes = parsedSingleUnionTypes;
        this.unknownSingleUnionType = unknownSingleUnionType;
    }

    public writeToFile(file: SdkFile): void {
        this.writeTypeAlias(file);
        this.writeModule(file);
        this.writeConst(file);
    }

    /**************
     * TYPE ALIAS *
     **************/

    private writeTypeAlias(file: SdkFile): void {
        const typeAlias = file.sourceFile.addTypeAlias({
            name: this.typeName,
            type: getWriterForMultiLineUnionType([
                ...this.parsedSingleUnionTypes.map((singleUnionType) => ({
                    node: this.getReferenceToSingleUnionType(singleUnionType, file),
                    docs: singleUnionType.getDocs(),
                })),
                {
                    node: this.getReferenceToUnknownType(file),
                    docs: undefined,
                },
            ]),
            isExported: true,
        });
        maybeAddDocs(typeAlias, this.docs);
    }

    public getReferenceToSingleUnionType(singleUnionType: ParsedSingleUnionType, file: SdkFile): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                this.getReferenceToUnion(file).getEntityName(),
                singleUnionType.getInterfaceName()
            )
        );
    }

    private getReferenceToUnknownType(file: SdkFile): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                this.getReferenceToUnion(file).getEntityName(),
                UnionGenerator.UNKNOWN_SINGLE_UNION_TYPE_INTERFACE_NAME
            )
        );
    }

    /**********
     * MODULE *
     **********/

    private writeModule(file: SdkFile): void {
        const module = file.sourceFile.addModule({
            name: this.typeName,
            isExported: true,
            hasDeclareKeyword: true,
        });
        module.addInterfaces(this.getSingleUnionTypeInterfaces(file));
        module.addInterface(this.getUtilsInterface(file));
        module.addInterface(this.getVisitorInterface(file));
    }

    private getSingleUnionTypeInterfaces(file: SdkFile): OptionalKind<InterfaceDeclarationStructure>[] {
        const interfaces = [
            ...this.parsedSingleUnionTypes.map((singleUnionType) => singleUnionType.getInterfaceDeclaration(file)),
            AbstractParsedSingleUnionType.createDiscriminatedInterface({
                typeName: UnionGenerator.UNKNOWN_SINGLE_UNION_TYPE_INTERFACE_NAME,
                discriminant: this.discriminant,
                discriminantValue: this.unknownSingleUnionType.discriminantType,
                nonDiscriminantProperties: this.unknownSingleUnionType.getNonDiscriminantProperties?.(file),
            }),
        ];

        for (const interface_ of interfaces) {
            interface_.extends.push(ts.factory.createTypeReferenceNode(UnionGenerator.UTILS_INTERFACE_NAME));
        }

        return interfaces.map((interface_) => ({
            name: interface_.name,
            extends: interface_.extends.map(getTextOfTsNode),
            properties: interface_.jsonProperties,
        }));
    }

    private getUtilsInterface(file: SdkFile): OptionalKind<InterfaceDeclarationStructure> {
        return {
            name: UnionGenerator.UTILS_INTERFACE_NAME,
            properties: [
                {
                    name: UnionGenerator.VISIT_UTIL_PROPERTY_NAME,
                    type: getTextOfTsNode(this.getVisitSignature(file)),
                },
            ],
        };
    }

    private getVisitSignature(file: SdkFile): ts.FunctionTypeNode {
        return ts.factory.createFunctionTypeNode(
            [
                ts.factory.createTypeParameterDeclaration(
                    undefined,
                    ts.factory.createIdentifier(UnionGenerator.VISITOR_RETURN_TYPE),
                    undefined,
                    undefined
                ),
            ],
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    ts.factory.createIdentifier(UnionGenerator.VISITOR_PARAMETER_NAME),
                    undefined,
                    this.getReferenceToVisitorInterface(file)
                ),
            ],
            ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier(UnionGenerator.VISITOR_RETURN_TYPE),
                undefined
            )
        );
    }

    private getVisitorInterface(file: SdkFile): OptionalKind<InterfaceDeclarationStructure> {
        return {
            name: UnionGenerator.VISITOR_INTERFACE_NAME,
            typeParameters: [
                {
                    name: UnionGenerator.VISITOR_RETURN_TYPE,
                },
            ],
            properties: [
                ...this.parsedSingleUnionTypes.map<OptionalKind<PropertySignatureStructure>>((singleUnionType) => ({
                    name: singleUnionType.getVisitorKey(),
                    type: getTextOfTsNode(singleUnionType.getVisitMethodSignature(file)),
                })),
                {
                    name: UnionGenerator.UNKNOWN_VISITOR_KEY,
                    type: getTextOfTsNode(
                        AbstractParsedSingleUnionType.getVisitorPropertySignature({
                            parameterType: this.unknownSingleUnionType.getVisitorArgument(file),
                        })
                    ),
                },
            ],
        };
    }

    public getReferenceToVisitorInterface(file: SdkFile): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                this.getReferenceToUnion(file).getEntityName(),
                UnionGenerator.VISITOR_INTERFACE_NAME
            ),
            [ts.factory.createTypeReferenceNode(UnionGenerator.VISITOR_RETURN_TYPE)]
        );
    }

    /*********
     * CONST *
     *********/

    private writeConst(file: SdkFile): void {
        if (this.parsedSingleUnionTypes.length === 0) {
            return;
        }

        const writer = FernWriters.object.writer({ asConst: true });

        this.addBuilderProperties(file, writer);
        this.addVisitProperty(file, writer);

        file.sourceFile.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
                {
                    name: this.typeName,
                    initializer: writer.toFunction(),
                },
            ],
            isExported: true,
        });
    }

    private addBuilderProperties(file: SdkFile, writer: ObjectWriter) {
        for (const singleUnionType of this.parsedSingleUnionTypes) {
            writer.addProperty({
                key: singleUnionType.getBuilderName(),
                value: getTextOfTsNode(singleUnionType.getBuilder(file, this)),
            });
            writer.addNewLine();
        }
    }

    private addVisitProperty(file: SdkFile, writer: ObjectWriter) {
        const referenceToUnion = this.getReferenceToUnion(file);
        writer.addProperty({
            key: UnionGenerator.VISIT_UTIL_PROPERTY_NAME,
            value: getTextOfTsNode(
                ts.factory.createArrowFunction(
                    undefined,
                    [
                        ts.factory.createTypeParameterDeclaration(
                            undefined,
                            ts.factory.createIdentifier(UnionGenerator.VISITOR_RETURN_TYPE)
                        ),
                    ],
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(UnionGenerator.VISITEE_PARAMETER_NAME),
                            undefined,
                            referenceToUnion.getTypeNode(),
                            undefined
                        ),
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(UnionGenerator.VISITOR_PARAMETER_NAME),
                            undefined,
                            this.getReferenceToVisitorInterface(file),
                            undefined
                        ),
                    ],
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createIdentifier(UnionGenerator.VISITOR_RETURN_TYPE),
                        undefined
                    ),
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.factory.createBlock(
                        [
                            ts.factory.createSwitchStatement(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(UnionGenerator.VISITEE_PARAMETER_NAME),
                                    ts.factory.createIdentifier(
                                        AbstractParsedSingleUnionType.getDiscriminantKey(this.discriminant)
                                    )
                                ),
                                ts.factory.createCaseBlock([
                                    ...this.parsedSingleUnionTypes.map((parsedSingleUnionType) =>
                                        ts.factory.createCaseClause(
                                            ts.factory.createStringLiteral(
                                                parsedSingleUnionType.getDiscriminantValue()
                                            ),
                                            [
                                                ts.factory.createReturnStatement(
                                                    parsedSingleUnionType.invokeVisitMethod({
                                                        localReferenceToUnionValue: ts.factory.createIdentifier(
                                                            UnionGenerator.VISITEE_PARAMETER_NAME
                                                        ),
                                                        localReferenceToVisitor: ts.factory.createIdentifier(
                                                            UnionGenerator.VISITOR_PARAMETER_NAME
                                                        ),
                                                    })
                                                ),
                                            ]
                                        )
                                    ),
                                    ts.factory.createDefaultClause([
                                        ts.factory.createReturnStatement(
                                            ts.factory.createCallExpression(
                                                ts.factory.createPropertyAccessExpression(
                                                    ts.factory.createIdentifier(UnionGenerator.VISITOR_PARAMETER_NAME),
                                                    ts.factory.createIdentifier(UnionGenerator.UNKNOWN_VISITOR_KEY)
                                                ),
                                                undefined,
                                                [
                                                    ts.factory.createAsExpression(
                                                        ts.factory.createIdentifier(
                                                            UnionGenerator.VISITOR_PARAMETER_NAME
                                                        ),
                                                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                                    ),
                                                ]
                                            )
                                        ),
                                    ]),
                                ])
                            ),
                        ],
                        true
                    )
                )
            ),
        });
    }
}
