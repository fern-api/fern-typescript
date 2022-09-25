import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import {
    DeclaredTypeName,
    SingleUnionType,
    SingleUnionTypeProperties,
    SingleUnionTypeProperty,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
import {
    FernWriters,
    getTextOfTsKeyword,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
    visitorUtils,
} from "@fern-typescript/commons";
import { createPropertyAssignment, TypeReferenceNode } from "@fern-typescript/commons-v2";
import { SdkFile, Zurg } from "@fern-typescript/sdk-declaration-handler";
import {
    InterfaceDeclaration,
    InterfaceDeclarationStructure,
    OptionalKind,
    ts,
    VariableDeclarationKind,
    WriterFunction,
} from "ts-morph";
import { getSchemaFromTypeReference } from "../getSchemaFromTypeReference";
import { getKeyForUnion } from "./utils";

const UTILS_INTERFACE_NAME = "_Utils";

export declare namespace generateUnionType {
    export interface Args {
        typeFile: SdkFile;
        schemaFile: SdkFile;
        typeName: string;
        declaredTypeName: DeclaredTypeName;
        docs: string | null | undefined;
        union: UnionTypeDeclaration;
    }
}

export function generateUnionType({
    typeFile,
    schemaFile,
    typeName,
    declaredTypeName,
    docs,
    union,
}: generateUnionType.Args): void {
    const typeAlias = typeFile.sourceFile.addTypeAlias({
        name: typeName,
        type: getWriterForMultiLineUnionType(
            union.types.map((type) => ({
                node: ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(typeName),
                        ts.factory.createIdentifier(getKeyForUnion(type))
                    ),
                    undefined
                ),
                docs: type.docs,
            }))
        ),
        isExported: true,
    });
    maybeAddDocs(typeAlias, docs);

    const module = typeFile.sourceFile.addModule({
        name: typeName,
        isExported: true,
        hasDeclareKeyword: true,
    });

    const visitorItems: visitorUtils.VisitableItems = {
        items: [],
        unknownArgument: {
            type: ts.factory.createTypeLiteralNode([
                ts.factory.createPropertySignature(
                    undefined,
                    ts.factory.createIdentifier(getDiscriminantKey(union.discriminantV2)),
                    undefined,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                ),
            ]),
            // TODO this doesn't apply anymore since we're not switching in the visit() method anymore
            argument: ts.factory.createNull(),
        },
    };

    const singleUnionTypeInterfaces: InterfaceDeclaration[] = [];
    for (const singleUnionType of union.types) {
        const interfaceNode = module.addInterface(
            generateDiscriminatedSingleUnionTypeInterface({ discriminant: union.discriminantV2, singleUnionType })
        );
        singleUnionTypeInterfaces.push(interfaceNode);

        const addVisitorItem = (visitorArgument: visitorUtils.Argument | undefined) => {
            visitorItems.items.push({
                caseInSwitchStatement: ts.factory.createStringLiteral(singleUnionType.discriminantValue.wireValue),
                keyInVisitor: getKeyInVisitor(singleUnionType),
                visitorArgument,
            });
        };

        SingleUnionTypeProperties._visit(singleUnionType.shape, {
            noProperties: () => {
                addVisitorItem(undefined);
            },
            samePropertiesAsObject: (typeName) => {
                const typeNode = typeFile.getReferenceToNamedType(typeName).typeNode;
                interfaceNode.addExtends(getTextOfTsNode(typeNode));
                addVisitorItem({
                    type: typeNode,
                    argument: ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                });
            },
            singleProperty: (singleProperty) => {
                const propertyName = getPropertyNameForSingleProperty(singleUnionType, singleProperty);
                const type = typeFile.getReferenceToType(singleProperty.type);
                interfaceNode.addProperty({
                    name: propertyName,
                    type: getTextOfTsNode(type.isOptional ? type.typeNodeWithoutUndefined : type.typeNode),
                    hasQuestionToken: type.isOptional,
                });
                addVisitorItem({
                    type: type.typeNode,
                    argument: ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                        ts.factory.createIdentifier(propertyName)
                    ),
                });
            },
            _unknown: () => {
                throw new Error("Unknown SingleUnionTypeProperties type: " + singleUnionType.shape._type);
            },
        });
    }

    singleUnionTypeInterfaces.push(
        module.addInterface({
            name: "_Unknown",
            properties: [
                {
                    name: getDiscriminantKey(union.discriminantV2),
                    type: getTextOfTsKeyword(ts.SyntaxKind.VoidKeyword),
                },
            ],
        })
    );

    for (const interfaceNode of singleUnionTypeInterfaces) {
        interfaceNode.addExtends(UTILS_INTERFACE_NAME);
    }

    module.addInterface({
        name: UTILS_INTERFACE_NAME,
        methods: [
            {
                name: visitorUtils.VISIT_PROPERTY_NAME,
                typeParameters: [{ name: visitorUtils.VISITOR_RESULT_TYPE_PARAMETER }],
                parameters: [
                    {
                        name: visitorUtils.VISITOR_PARAMETER_NAME,
                        type: getTextOfTsNode(
                            ts.factory.createTypeReferenceNode(visitorUtils.VISITOR_INTERFACE_NAME, [
                                ts.factory.createTypeReferenceNode(visitorUtils.VISITOR_RESULT_TYPE_PARAMETER),
                            ])
                        ),
                    },
                ],
                returnType: visitorUtils.VISITOR_RESULT_TYPE_PARAMETER,
            },
        ],
    });

    module.addInterface(visitorUtils.generateVisitorInterface({ items: visitorItems }));

    typeFile.sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: typeName,
                initializer: createUtils({
                    typeName,
                    union,
                    discriminant: union.discriminantV2,
                    file: typeFile,
                }),
            },
        ],
        isExported: true,
    });

    const rawValueParameterName = "raw";
    const parsedValueParameterName = "parsed";
    const schema = schemaFile.coreUtilities.zurg
        .union({
            rawDiscriminant: union.discriminantV2.wireValue,
            parsedDiscriminant: getDiscriminantKey(union.discriminantV2),
            singleUnionTypes: union.types.map((singleUnionType) => ({
                discriminantValue: singleUnionType.discriminantValue.wireValue,
                additionalProperties: SingleUnionTypeProperties._visit<
                    Zurg.union.SingleUnionType["additionalProperties"]
                >(singleUnionType.shape, {
                    noProperties: () => ({ isInline: true, properties: [] }),
                    singleProperty: (property) => ({
                        isInline: true,
                        properties: [
                            {
                                key: {
                                    parsed: getPropertyNameForSingleProperty(singleUnionType, property),
                                    raw: property.name.wireValue,
                                },
                                value: getSchemaFromTypeReference(property.type, schemaFile),
                            },
                        ],
                    }),
                    samePropertiesAsObject: (typeName) => ({
                        isInline: false,
                        objectSchema: schemaFile.getReferenceToTypeSchema(typeName),
                    }),
                    _unknown: () => {
                        throw new Error("Unknown SingleUnionTypeProperties type: " + singleUnionType.shape._type);
                    },
                }),
            })),
        })
        .transform({
            newShape: schemaFile.getReferenceToNamedType(declaredTypeName).typeNode,
            parse: ts.factory.createArrowFunction(
                undefined,
                undefined,
                [ts.factory.createParameterDeclaration(undefined, undefined, undefined, rawValueParameterName)],
                undefined,
                undefined,
                ts.factory.createBlock(
                    [
                        ts.factory.createSwitchStatement(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(rawValueParameterName),
                                getDiscriminantKey(union.discriminantV2)
                            ),
                            ts.factory.createCaseBlock([
                                ...union.types.map((singleUnionType) =>
                                    ts.factory.createCaseClause(
                                        ts.factory.createStringLiteral(singleUnionType.discriminantValue.wireValue),
                                        [
                                            ts.factory.createBlock(
                                                [
                                                    ts.factory.createReturnStatement(
                                                        ts.factory.createObjectLiteralExpression(
                                                            [
                                                                ts.factory.createSpreadAssignment(
                                                                    ts.factory.createIdentifier("raw")
                                                                ),
                                                                ts.factory.createPropertyAssignment(
                                                                    ts.factory.createIdentifier("_visit"),
                                                                    ts.factory.createArrowFunction(
                                                                        undefined,
                                                                        undefined,
                                                                        [
                                                                            ts.factory.createParameterDeclaration(
                                                                                undefined,
                                                                                undefined,
                                                                                undefined,
                                                                                ts.factory.createIdentifier(
                                                                                    visitorUtils.VISITOR_PARAMETER_NAME
                                                                                ),
                                                                                undefined,
                                                                                undefined
                                                                            ),
                                                                        ],
                                                                        undefined,
                                                                        ts.factory.createToken(
                                                                            ts.SyntaxKind.EqualsGreaterThanToken
                                                                        ),
                                                                        ts.factory.createCallExpression(
                                                                            ts.factory.createPropertyAccessExpression(
                                                                                ts.factory.createIdentifier(
                                                                                    visitorUtils.VISITOR_PARAMETER_NAME
                                                                                ),
                                                                                ts.factory.createIdentifier(
                                                                                    getKeyInVisitor(singleUnionType)
                                                                                )
                                                                            ),
                                                                            undefined,
                                                                            SingleUnionTypeProperties._visit<
                                                                                ts.Expression[]
                                                                            >(singleUnionType.shape, {
                                                                                noProperties: () => [],
                                                                                singleProperty: (property) => [
                                                                                    ts.factory.createPropertyAccessExpression(
                                                                                        ts.factory.createIdentifier(
                                                                                            rawValueParameterName
                                                                                        ),
                                                                                        ts.factory.createIdentifier(
                                                                                            getPropertyNameForSingleProperty(
                                                                                                singleUnionType,
                                                                                                property
                                                                                            )
                                                                                        )
                                                                                    ),
                                                                                ],
                                                                                samePropertiesAsObject: () => [
                                                                                    ts.factory.createIdentifier(
                                                                                        rawValueParameterName
                                                                                    ),
                                                                                ],
                                                                                _unknown: () => {
                                                                                    throw new Error(
                                                                                        "Unknown SingleUnionTypeProperties type: " +
                                                                                            singleUnionType.shape._type
                                                                                    );
                                                                                },
                                                                            })
                                                                        )
                                                                    )
                                                                ),
                                                            ],
                                                            true
                                                        )
                                                    ),
                                                ],
                                                true
                                            ),
                                        ]
                                    )
                                ),
                                ts.factory.createDefaultClause([
                                    ts.factory.createBlock(
                                        [
                                            ts.factory.createReturnStatement(
                                                ts.factory.createObjectLiteralExpression(
                                                    [
                                                        ts.factory.createSpreadAssignment(
                                                            ts.factory.createParenthesizedExpression(
                                                                ts.factory.createAsExpression(
                                                                    ts.factory.createIdentifier(rawValueParameterName),
                                                                    ts.factory.createKeywordTypeNode(
                                                                        ts.SyntaxKind.AnyKeyword
                                                                    )
                                                                )
                                                            )
                                                        ),
                                                        ts.factory.createPropertyAssignment(
                                                            ts.factory.createIdentifier(
                                                                visitorUtils.VISIT_PROPERTY_NAME
                                                            ),
                                                            ts.factory.createArrowFunction(
                                                                undefined,
                                                                undefined,
                                                                [
                                                                    ts.factory.createParameterDeclaration(
                                                                        undefined,
                                                                        undefined,
                                                                        undefined,
                                                                        ts.factory.createIdentifier(
                                                                            visitorUtils.VISITOR_PARAMETER_NAME
                                                                        ),
                                                                        undefined,
                                                                        undefined
                                                                    ),
                                                                ],
                                                                undefined,
                                                                undefined,
                                                                ts.factory.createCallExpression(
                                                                    ts.factory.createPropertyAccessExpression(
                                                                        ts.factory.createIdentifier(
                                                                            visitorUtils.VISITOR_PARAMETER_NAME
                                                                        ),
                                                                        ts.factory.createIdentifier(
                                                                            visitorUtils.UNKNOWN_PROPERY_NAME
                                                                        )
                                                                    ),
                                                                    undefined,
                                                                    [ts.factory.createIdentifier(rawValueParameterName)]
                                                                )
                                                            )
                                                        ),
                                                    ],
                                                    true
                                                )
                                            ),
                                        ],
                                        true
                                    ),
                                ]),
                            ])
                        ),
                    ],
                    true
                )
            ),
            json: ts.factory.createArrowFunction(
                undefined,
                undefined,
                [
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        ts.factory.createIdentifier(parsedValueParameterName),
                        undefined,
                        undefined
                    ),
                ],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                ts.factory.createAsExpression(
                    ts.factory.createIdentifier(parsedValueParameterName),
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Exclude"), [
                        ts.factory.createTypeQueryNode(
                            ts.factory.createIdentifier(parsedValueParameterName),
                            undefined
                        ),
                        ts.factory.createTypeLiteralNode([
                            ts.factory.createPropertySignature(
                                undefined,
                                ts.factory.createIdentifier(getDiscriminantKey(union.discriminantV2)),
                                undefined,
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                            ),
                        ]),
                    ])
                )
            ),
        });

    schemaFile.sourceFile.addVariableStatement({
        isExported: true,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: typeName,
                initializer: getTextOfTsNode(schema.toExpression()),
            },
        ],
    });
}

function generateDiscriminatedSingleUnionTypeInterface({
    discriminant,
    singleUnionType,
}: {
    discriminant: WireStringWithAllCasings;
    singleUnionType: SingleUnionType;
}): OptionalKind<InterfaceDeclarationStructure> {
    return {
        name: getKeyForUnion(singleUnionType),
        properties: [
            {
                name: getDiscriminantKey(discriminant),
                type: getTextOfTsNode(ts.factory.createStringLiteral(singleUnionType.discriminantValue.wireValue)),
            },
        ],
    };
}

function createUtils({
    typeName,
    union,
    discriminant,
    file,
}: {
    typeName: string;
    union: UnionTypeDeclaration;
    discriminant: WireStringWithAllCasings;
    file: SdkFile;
}): WriterFunction {
    const writer = FernWriters.object.writer({ asConst: true });

    for (const singleUnionType of union.types) {
        writer.addProperty({
            key: singleUnionType.discriminantValue.camelCase,
            value: getTextOfTsNode(
                generateBuilder({
                    typeName,
                    singleUnionType,
                    discriminant,
                    file,
                })
            ),
        });
        writer.addNewLine();
    }

    return writer.toFunction();
}

function generateBuilder({
    typeName,
    discriminant,
    singleUnionType,
    file,
}: {
    typeName: string;
    discriminant: WireStringWithAllCasings;
    singleUnionType: SingleUnionType;
    file: SdkFile;
}): ts.ArrowFunction {
    const VALUE_PARAMETER_NAME = "value";

    const parameterType = SingleUnionTypeProperties._visit<TypeReferenceNode | undefined>(singleUnionType.shape, {
        noProperties: () => undefined,
        samePropertiesAsObject: (typeName) => {
            const reference = file.getReferenceToNamedType(typeName);
            return { isOptional: false, typeNode: reference.typeNode };
        },
        singleProperty: (singleProperty) => file.getReferenceToType(singleProperty.type),
        _unknown: () => {
            throw new Error("Unknown SingleUnionTypeProperties: " + singleUnionType.shape._type);
        },
    });

    const parameter =
        parameterType != null
            ? ts.factory.createParameterDeclaration(
                  undefined,
                  undefined,
                  undefined,
                  VALUE_PARAMETER_NAME,
                  parameterType.isOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                  parameterType.isOptional ? parameterType.typeNodeWithoutUndefined : parameterType.typeNode,
                  undefined
              )
            : undefined;

    const maybeValueAssignment = SingleUnionTypeProperties._visit(singleUnionType.shape, {
        noProperties: () => [],
        samePropertiesAsObject: () => [
            ts.factory.createSpreadAssignment(ts.factory.createIdentifier(VALUE_PARAMETER_NAME)),
        ],
        singleProperty: (singleProperty) => [
            createPropertyAssignment(
                ts.factory.createIdentifier(getPropertyNameForSingleProperty(singleUnionType, singleProperty)),
                ts.factory.createIdentifier(VALUE_PARAMETER_NAME)
            ),
        ],
        _unknown: () => {
            throw new Error("Unknown SingleUnionTypeProperties: " + singleUnionType.shape._type);
        },
    });

    return ts.factory.createArrowFunction(
        undefined,
        undefined,
        parameter != null ? [parameter] : [],
        getQualifiedUnionTypeReference({ typeName, singleUnionType }),
        undefined,
        ts.factory.createParenthesizedExpression(
            ts.factory.createObjectLiteralExpression(
                [
                    createPropertyAssignment(
                        ts.factory.createIdentifier(getDiscriminantKey(discriminant)),
                        ts.factory.createStringLiteral(singleUnionType.discriminantValue.wireValue)
                    ),
                    ...maybeValueAssignment,
                    createPropertyAssignment(
                        ts.factory.createIdentifier(visitorUtils.VISIT_PROPERTY_NAME),
                        ts.factory.createArrowFunction(
                            undefined,
                            undefined,
                            [
                                ts.factory.createParameterDeclaration(
                                    undefined,
                                    undefined,
                                    undefined,
                                    visitorUtils.VISITOR_PARAMETER_NAME
                                ),
                            ],
                            undefined,
                            undefined,
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(visitorUtils.VISITOR_PARAMETER_NAME),
                                    getKeyInVisitor(singleUnionType)
                                ),
                                undefined,
                                parameter != null ? [ts.factory.createIdentifier(VALUE_PARAMETER_NAME)] : []
                            )
                        )
                    ),
                ],
                true
            )
        )
    );
}

function getQualifiedUnionTypeReference({
    typeName,
    singleUnionType,
}: {
    typeName: string;
    singleUnionType: SingleUnionType;
}) {
    return ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
            ts.factory.createIdentifier(typeName),
            ts.factory.createIdentifier(getKeyForUnion(singleUnionType))
        ),
        undefined
    );
}

function getPropertyNameForSingleProperty(
    singleUnionType: SingleUnionType,
    _property: SingleUnionTypeProperty
): string {
    // TODO change this to _property.name.wireValue when we're ready to break the wire
    return singleUnionType.discriminantValue.wireValue;
}

function getKeyInVisitor(singleUnionType: SingleUnionType): string {
    return singleUnionType.discriminantValue.camelCase;
}

function getDiscriminantKey(discriminant: WireStringWithAllCasings): string {
    return discriminant.camelCase;
}
