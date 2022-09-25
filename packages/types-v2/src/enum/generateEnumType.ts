import { DeclaredTypeName, EnumTypeDeclaration, EnumValue } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs, visitorUtils } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts, VariableDeclarationKind } from "ts-morph";

export const ENUM_VALUES_PROPERTY_KEY = "_values";

export function generateEnumType({
    typeFile,
    schemaFile,
    typeName,
    declaredTypeName,
    docs,
    shape,
}: {
    typeFile: SdkFile;
    schemaFile: SdkFile;
    typeName: string;
    docs: string | null | undefined;
    declaredTypeName: DeclaredTypeName;
    shape: EnumTypeDeclaration;
}): void {
    const enumInterface = typeFile.sourceFile.addInterface({
        name: typeName,
        isExported: true,
    });
    maybeAddDocs(enumInterface, docs);

    const enumUtilsStatement = typeFile.sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
            {
                name: enumInterface.getName(),
            },
        ],
    });
    const enumUtils = enumUtilsStatement.getDeclarations()[0]!;

    const enumModule = typeFile.sourceFile.addModule({
        name: enumInterface.getName(),
        isExported: true,
        hasDeclareKeyword: true,
    });

    const rawValueTypeAlias = enumModule.addTypeAlias({
        name: "RawValue",
        type: getTextOfTsNode(
            ts.factory.createUnionTypeNode([
                ...shape.values.map((value) =>
                    ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value.value))
                ),
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            ])
        ),
    });

    const getQualfiedReferenceToModuleExport = (name: string) =>
        ts.factory.createQualifiedName(
            ts.factory.createIdentifier(enumModule.getName()),
            ts.factory.createIdentifier(name)
        );

    const visitorItems: visitorUtils.VisitableItems = {
        items: shape.values.map((enumValue) => ({
            caseInSwitchStatement: ts.factory.createStringLiteral(enumValue.value),
            keyInVisitor: getVisitMethodName(enumValue),
            visitorArgument: undefined,
        })),
        unknownArgument: {
            type: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            // TODO this doesn't apply anymore since we're not switching in the visit() method anymore
            argument: ts.factory.createNull(),
        },
    };

    const visitorInterface = enumModule.addInterface(
        visitorUtils.generateVisitorInterface({ items: visitorItems, name: "Visitor" })
    );

    const qualifiedReferenceToRawValueType = getQualfiedReferenceToModuleExport(rawValueTypeAlias.getName());

    const enumInterfaceTypeParameter = enumInterface.addTypeParameter({
        name: rawValueTypeAlias.getName(),
        constraint: getTextOfTsNode(qualifiedReferenceToRawValueType),
        default: getTextOfTsNode(qualifiedReferenceToRawValueType),
    });

    const qualifiedReferenceToVisitor = getQualfiedReferenceToModuleExport(visitorInterface.getName());

    const getMethod = enumInterface.addMethod({
        name: "get",
        returnType: enumInterfaceTypeParameter.getName(),
    });

    const visitMethod = enumInterface.addMethod({
        name: "visit",
        typeParameters: [
            {
                name: visitorUtils.VISITOR_RESULT_TYPE_PARAMETER,
            },
        ],
        parameters: [
            {
                name: "visitor",
                type: getTextOfTsNode(
                    ts.factory.createTypeReferenceNode(qualifiedReferenceToVisitor, [
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createIdentifier(visitorUtils.VISITOR_RESULT_TYPE_PARAMETER),
                            undefined
                        ),
                    ])
                ),
            },
        ],
        returnType: visitorUtils.VISITOR_RESULT_TYPE_PARAMETER,
    });

    const enumUtilsProperties: ts.PropertyAssignment[] = [];
    const enumBuilders: ts.CallExpression[] = [];
    for (const value of shape.values) {
        const builderName = getBuilderMethodName(value);
        enumUtilsProperties.push(
            ts.factory.createPropertyAssignment(
                builderName,
                ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [],
                    ts.factory.createTypeReferenceNode(enumInterface.getName(), [
                        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value.value)),
                    ]),
                    undefined,
                    ts.factory.createParenthesizedExpression(
                        ts.factory.createObjectLiteralExpression(
                            [
                                ts.factory.createPropertyAssignment(
                                    getMethod.getName(),
                                    ts.factory.createArrowFunction(
                                        undefined,
                                        undefined,
                                        [],
                                        undefined,
                                        undefined,
                                        ts.factory.createStringLiteral(value.value)
                                    )
                                ),
                                ts.factory.createPropertyAssignment(
                                    visitMethod.getName(),
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
                                                ts.factory.createIdentifier(getVisitMethodName(value))
                                            ),
                                            undefined,
                                            []
                                        )
                                    )
                                ),
                            ],
                            true
                        )
                    )
                )
            )
        );
        enumBuilders.push(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(enumUtils.getName()),
                    builderName
                ),
                undefined,
                undefined
            )
        );
    }

    enumUtilsProperties.push(
        ts.factory.createPropertyAssignment(
            "_values",
            ts.factory.createArrowFunction(
                undefined,
                undefined,
                [],
                ts.factory.createArrayTypeNode(
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(enumInterface.getName()))
                ),
                undefined,
                ts.factory.createArrayLiteralExpression(enumBuilders, false)
            )
        )
    );

    enumUtils.setInitializer(getTextOfTsNode(ts.factory.createObjectLiteralExpression(enumUtilsProperties, true)));

    const rawValueParameterName = "raw";
    const parsedValueParameterName = "parsed";
    const schema = schemaFile.coreUtilities.zurg.string().transform({
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
                        ts.factory.createIdentifier(rawValueParameterName),
                        ts.factory.createCaseBlock([
                            ...shape.values.map((value) =>
                                ts.factory.createCaseClause(ts.factory.createStringLiteral(value.value), [
                                    ts.factory.createBlock(
                                        [
                                            ts.factory.createReturnStatement(
                                                ts.factory.createCallExpression(
                                                    ts.factory.createPropertyAccessExpression(
                                                        schemaFile.getReferenceToNamedType(declaredTypeName).expression,
                                                        ts.factory.createIdentifier(getBuilderMethodName(value))
                                                    ),
                                                    undefined,
                                                    []
                                                )
                                            ),
                                        ],
                                        true
                                    ),
                                ])
                            ),
                            ts.factory.createDefaultClause([
                                ts.factory.createBlock(
                                    [
                                        ts.factory.createReturnStatement(
                                            ts.factory.createObjectLiteralExpression(
                                                [
                                                    ts.factory.createPropertyAssignment(
                                                        ts.factory.createIdentifier(getMethod.getName()),
                                                        ts.factory.createArrowFunction(
                                                            undefined,
                                                            undefined,
                                                            [],
                                                            undefined,
                                                            ts.factory.createToken(
                                                                ts.SyntaxKind.EqualsGreaterThanToken
                                                            ),
                                                            ts.factory.createIdentifier(rawValueParameterName)
                                                        )
                                                    ),
                                                    ts.factory.createPropertyAssignment(
                                                        ts.factory.createIdentifier(visitMethod.getName()),
                                                        ts.factory.createArrowFunction(
                                                            undefined,
                                                            undefined,
                                                            [
                                                                ts.factory.createParameterDeclaration(
                                                                    undefined,
                                                                    undefined,
                                                                    undefined,
                                                                    visitorUtils.VISITOR_PARAMETER_NAME,
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
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(parsedValueParameterName),
                    ts.factory.createIdentifier(getMethod.getName())
                ),
                undefined,
                []
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

function getVisitMethodName(enumValue: EnumValue): string {
    return enumValue.name.camelCase;
}

function getBuilderMethodName(enumValue: EnumValue): string {
    return enumValue.name.pascalCase;
}
