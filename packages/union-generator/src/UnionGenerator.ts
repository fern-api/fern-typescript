import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import {
    FernWriters,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
    ObjectWriter,
} from "@fern-typescript/commons";
import { ModelContext, Reference } from "@fern-typescript/sdk-declaration-handler";
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
        getReferenceToUnion: (context: ModelContext) => Reference;
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

    public readonly getReferenceToUnion: (context: ModelContext) => Reference;

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

    public writeToFile(context: ModelContext): void {
        this.writeTypeAlias(context);
        this.writeModule(context);
        this.writeConst(context);
    }

    /**************
     * TYPE ALIAS *
     **************/

    private writeTypeAlias(context: ModelContext): void {
        const typeAlias = context.sourceFile.addTypeAlias({
            name: this.typeName,
            type: getWriterForMultiLineUnionType([
                ...this.parsedSingleUnionTypes.map((singleUnionType) => ({
                    node: this.getReferenceToSingleUnionType(singleUnionType, context),
                    docs: singleUnionType.getDocs(),
                })),
                {
                    node: this.getReferenceToUnknownType(context),
                    docs: undefined,
                },
            ]),
            isExported: true,
        });
        maybeAddDocs(typeAlias, this.docs);
    }

    public getReferenceToSingleUnionType(singleUnionType: ParsedSingleUnionType, context: ModelContext): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                this.getReferenceToUnion(context).getEntityName(),
                singleUnionType.getInterfaceName()
            )
        );
    }

    private getReferenceToUnknownType(context: ModelContext): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                this.getReferenceToUnion(context).getEntityName(),
                UnionGenerator.UNKNOWN_SINGLE_UNION_TYPE_INTERFACE_NAME
            )
        );
    }

    /**********
     * MODULE *
     **********/

    private writeModule(context: ModelContext): void {
        const module = context.sourceFile.addModule({
            name: this.typeName,
            isExported: true,
            hasDeclareKeyword: true,
        });
        module.addInterfaces(this.getSingleUnionTypeInterfaces(context));
        module.addInterface(this.getUtilsInterface(context));
        module.addInterface(this.getVisitorInterface(context));
    }

    private getSingleUnionTypeInterfaces(context: ModelContext): OptionalKind<InterfaceDeclarationStructure>[] {
        const interfaces = [
            ...this.parsedSingleUnionTypes.map((singleUnionType) => singleUnionType.getInterfaceDeclaration(context)),
            AbstractParsedSingleUnionType.createDiscriminatedInterface({
                typeName: UnionGenerator.UNKNOWN_SINGLE_UNION_TYPE_INTERFACE_NAME,
                discriminant: this.discriminant,
                discriminantValue: this.unknownSingleUnionType.discriminantType,
                nonDiscriminantProperties: this.unknownSingleUnionType.getNonDiscriminantProperties?.(context),
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

    private getUtilsInterface(context: ModelContext): OptionalKind<InterfaceDeclarationStructure> {
        return {
            name: UnionGenerator.UTILS_INTERFACE_NAME,
            properties: [
                {
                    name: UnionGenerator.VISIT_UTIL_PROPERTY_NAME,
                    type: getTextOfTsNode(this.getVisitSignature(context)),
                },
            ],
        };
    }

    private getVisitSignature(context: ModelContext): ts.FunctionTypeNode {
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
                    this.getReferenceToVisitorInterface(context)
                ),
            ],
            ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier(UnionGenerator.VISITOR_RETURN_TYPE),
                undefined
            )
        );
    }

    private getVisitorInterface(context: ModelContext): OptionalKind<InterfaceDeclarationStructure> {
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
                    type: getTextOfTsNode(singleUnionType.getVisitMethodSignature(context)),
                })),
                {
                    name: UnionGenerator.UNKNOWN_VISITOR_KEY,
                    type: getTextOfTsNode(
                        AbstractParsedSingleUnionType.getVisitorPropertySignature({
                            parameterType: this.unknownSingleUnionType.getVisitorArgument(context),
                        })
                    ),
                },
            ],
        };
    }

    public getReferenceToVisitorInterface(context: ModelContext): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                this.getReferenceToUnion(context).getEntityName(),
                UnionGenerator.VISITOR_INTERFACE_NAME
            ),
            [ts.factory.createTypeReferenceNode(UnionGenerator.VISITOR_RETURN_TYPE)]
        );
    }

    /*********
     * CONST *
     *********/

    private writeConst(context: ModelContext): void {
        if (this.parsedSingleUnionTypes.length === 0) {
            return;
        }

        const writer = FernWriters.object.writer({ asConst: true });

        this.addBuilderProperties(context, writer);
        this.addVisitProperty(context, writer);

        context.sourceFile.addVariableStatement({
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

    private addBuilderProperties(context: ModelContext, writer: ObjectWriter) {
        for (const singleUnionType of this.parsedSingleUnionTypes) {
            writer.addProperty({
                key: singleUnionType.getBuilderName(),
                value: getTextOfTsNode(singleUnionType.getBuilder(context, this)),
            });
            writer.addNewLine();
        }
    }

    private addVisitProperty(context: ModelContext, writer: ObjectWriter) {
        const referenceToUnion = this.getReferenceToUnion(context);
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
                            this.getReferenceToVisitorInterface(context),
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
