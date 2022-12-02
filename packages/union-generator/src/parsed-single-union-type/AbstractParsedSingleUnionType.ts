import { getTextOfTsNode } from "@fern-typescript/commons";
import { WithBaseContextMixin } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { GeneratedUnionImpl } from "../GeneratedUnionImpl";
import { SingleUnionTypeGenerator } from "../single-union-type-generator/SingleUnionTypeGenerator";
import { ParsedSingleUnionType } from "./ParsedSingleUnionType";

export abstract class AbstractParsedSingleUnionType<Context extends WithBaseContextMixin>
    implements ParsedSingleUnionType<Context>
{
    private static VISITOR_PARAMETER_NAME = "visitor";

    constructor(private readonly singleUnionType: SingleUnionTypeGenerator<Context>) {}

    public getInterfaceDeclaration(
        context: Context,
        generatedUnion: GeneratedUnionImpl<Context>
    ): ParsedSingleUnionType.InterfaceDeclaration {
        return {
            name: this.getInterfaceName(),
            extends: this.singleUnionType.getExtendsForInterface(context),
            jsonProperties: [
                {
                    name: generatedUnion.discriminant,
                    type: getTextOfTsNode(this.getDiscriminantValueType()),
                },
                ...this.singleUnionType.getNonDiscriminantPropertiesForInterface(context),
            ],
        };
    }

    public getBuilder(context: Context, generatedUnion: GeneratedUnionImpl<Context>): ts.ArrowFunction {
        const VALUE_WITHOUT_VISIT_VARIABLE_NAME = "valueWithoutVisit";
        const referenceToBuiltType = generatedUnion.getReferenceToSingleUnionType(this, context);

        return ts.factory.createArrowFunction(
            undefined,
            undefined,
            this.singleUnionType.getParametersForBuilder(context, { discriminant: generatedUnion.discriminant }),
            referenceToBuiltType,
            undefined,
            ts.factory.createBlock(
                [
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    ts.factory.createIdentifier(VALUE_WITHOUT_VISIT_VARIABLE_NAME),
                                    undefined,
                                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Omit"), [
                                        referenceToBuiltType,
                                        ts.factory.createLiteralTypeNode(
                                            ts.factory.createStringLiteral(GeneratedUnionImpl.VISIT_UTIL_PROPERTY_NAME)
                                        ),
                                    ]),
                                    ts.factory.createObjectLiteralExpression(
                                        [
                                            ...this.singleUnionType.getNonDiscriminantPropertiesForBuilder(context),
                                            ts.factory.createPropertyAssignment(
                                                generatedUnion.discriminant,
                                                this.getDiscriminantValue()
                                            ),
                                        ],
                                        true
                                    )
                                ),
                            ],
                            ts.NodeFlags.Const
                        )
                    ),
                    ts.factory.createReturnStatement(
                        context.base.coreUtilities.base.addNonEnumerableProperty(
                            ts.factory.createIdentifier(VALUE_WITHOUT_VISIT_VARIABLE_NAME),
                            ts.factory.createStringLiteral(GeneratedUnionImpl.VISIT_UTIL_PROPERTY_NAME),
                            ts.factory.createFunctionExpression(
                                undefined,
                                undefined,
                                undefined,
                                [
                                    ts.factory.createTypeParameterDeclaration(
                                        undefined,
                                        GeneratedUnionImpl.VISITOR_RETURN_TYPE
                                    ),
                                ],
                                [
                                    ts.factory.createParameterDeclaration(
                                        undefined,
                                        undefined,
                                        undefined,
                                        "this",
                                        undefined,
                                        referenceToBuiltType,
                                        undefined
                                    ),
                                    ts.factory.createParameterDeclaration(
                                        undefined,
                                        undefined,
                                        undefined,
                                        AbstractParsedSingleUnionType.VISITOR_PARAMETER_NAME,
                                        undefined,
                                        generatedUnion.getReferenceToVisitorInterface(context)
                                    ),
                                ],
                                undefined,
                                ts.factory.createBlock(
                                    [
                                        ts.factory.createReturnStatement(
                                            ts.factory.createCallExpression(
                                                ts.factory.createPropertyAccessExpression(
                                                    generatedUnion.getReferenceToUnion(context).getExpression(),
                                                    GeneratedUnionImpl.VISIT_UTIL_PROPERTY_NAME
                                                ),
                                                undefined,
                                                [
                                                    ts.factory.createThis(),
                                                    ts.factory.createIdentifier(
                                                        AbstractParsedSingleUnionType.VISITOR_PARAMETER_NAME
                                                    ),
                                                ]
                                            )
                                        ),
                                    ],
                                    true
                                )
                            )
                        )
                    ),
                ],
                true
            )
        );
    }

    public getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[] {
        return this.singleUnionType.getBuilderArgsFromExistingValue(existingValue);
    }

    public getVisitMethod({
        localReferenceToUnionValue,
    }: {
        localReferenceToUnionValue: ts.Expression;
    }): ts.ArrowFunction {
        return ts.factory.createArrowFunction(
            undefined,
            [],
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    GeneratedUnionImpl.VISITOR_PARAMETER_NAME
                ),
            ],
            undefined,
            undefined,
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_PARAMETER_NAME),
                    ts.factory.createIdentifier(this.getVisitorKey())
                ),
                undefined,
                this.singleUnionType.getVisitorArguments({ localReferenceToUnionValue })
            )
        );
    }

    public getVisitMethodSignature(context: Context, generatedUnion: GeneratedUnionImpl<Context>): ts.FunctionTypeNode {
        const parameterType = this.singleUnionType.getVisitMethodParameterType(context, {
            discriminant: generatedUnion.discriminant,
        });
        return ts.factory.createFunctionTypeNode(
            undefined,
            parameterType != null
                ? [
                      ts.factory.createParameterDeclaration(
                          undefined,
                          undefined,
                          undefined,
                          GeneratedUnionImpl.VISITEE_PARAMETER_NAME,
                          undefined,
                          parameterType
                      ),
                  ]
                : [],
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_RETURN_TYPE))
        );
    }

    public invokeVisitMethod({
        localReferenceToUnionValue,
        localReferenceToVisitor,
    }: {
        localReferenceToUnionValue: ts.Expression;
        localReferenceToVisitor: ts.Expression;
    }): ts.Expression {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(localReferenceToVisitor, this.getVisitorKey()),
            undefined,
            this.singleUnionType.getVisitorArguments({ localReferenceToUnionValue })
        );
    }

    public getDiscriminantValue(): ts.Expression {
        const discriminantValueAsString = this.getDiscriminantValueAsString();
        return discriminantValueAsString != null
            ? ts.factory.createStringLiteral(discriminantValueAsString)
            : ts.factory.createIdentifier("undefined");
    }

    public getDiscriminantValueType(): ts.TypeNode {
        const discriminantValueAsString = this.getDiscriminantValueAsString();
        return discriminantValueAsString != null
            ? ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(discriminantValueAsString))
            : ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
    }

    public abstract getDocs(): string | null | undefined;
    public abstract getDiscriminantValueAsString(): string | undefined;
    public abstract getInterfaceName(): string;
    public abstract getBuilderName(): string;
    public abstract getVisitorKey(): string;
}
