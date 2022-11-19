import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { ParsedSingleUnionType } from "./ParsedSingleUnionType";
import { SingleUnionTypeGenerator } from "./SingleUnionTypeGenerator";
import { UnionGenerator } from "./UnionGenerator";

export abstract class AbstractParsedSingleUnionType implements ParsedSingleUnionType {
    constructor(private readonly singleUnionType: SingleUnionTypeGenerator) {}

    public getInterfaceDeclaration(file: SdkFile): ParsedSingleUnionType.InterfaceDeclaration {
        return AbstractParsedSingleUnionType.createDiscriminatedInterface({
            typeName: this.getInterfaceName(),
            discriminantValue: ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral(this.getDiscriminantValue())
            ),
            nonDiscriminantProperties: this.singleUnionType.getNonDiscriminantPropertiesForInterface(file),
            extends: this.singleUnionType.getExtendsForInterface(file),
            discriminant: this.getDiscriminant(),
        });
    }

    public static createDiscriminatedInterface({
        typeName,
        discriminant,
        discriminantValue,
        nonDiscriminantProperties = [],
        extends: extends_ = [],
    }: {
        typeName: string;
        discriminant: WireStringWithAllCasings;
        discriminantValue: ts.TypeNode;
        nonDiscriminantProperties?: OptionalKind<PropertySignatureStructure>[];
        extends?: ts.TypeNode[];
    }): ParsedSingleUnionType.InterfaceDeclaration {
        return {
            name: typeName,
            extends: extends_,
            jsonProperties: [
                {
                    name: AbstractParsedSingleUnionType.getDiscriminantKey(discriminant),
                    type: getTextOfTsNode(discriminantValue),
                },
                ...nonDiscriminantProperties,
            ],
        };
    }

    public getBuilder(file: SdkFile, unionGenerator: UnionGenerator): ts.ArrowFunction {
        const VALUE_WITHOUT_VISIT_VARIABLE_NAME = "valueWithoutVisit";
        const VISITOR_PARAMETER_NAME = "visitor";

        const referenceToBuiltType = unionGenerator.getReferenceToSingleUnionType(this, file);

        return ts.factory.createArrowFunction(
            undefined,
            undefined,
            this.singleUnionType.getParametersForBuilder(file),
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
                                            ts.factory.createStringLiteral(UnionGenerator.VISIT_UTIL_PROPERTY_NAME)
                                        ),
                                    ]),
                                    ts.factory.createObjectLiteralExpression(
                                        [
                                            ...this.singleUnionType.getNonDiscriminantPropertiesForBuilder(file),
                                            ts.factory.createPropertyAssignment(
                                                this.getDiscriminantKey(),
                                                ts.factory.createStringLiteral(this.getDiscriminantValue())
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
                        file.coreUtilities.base.addNonEnumerableProperty(
                            ts.factory.createIdentifier(VALUE_WITHOUT_VISIT_VARIABLE_NAME),
                            ts.factory.createStringLiteral(UnionGenerator.VISIT_UTIL_PROPERTY_NAME),
                            ts.factory.createFunctionExpression(
                                undefined,
                                undefined,
                                undefined,
                                [
                                    ts.factory.createTypeParameterDeclaration(
                                        undefined,
                                        UnionGenerator.VISITOR_RETURN_TYPE
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
                                        VISITOR_PARAMETER_NAME,
                                        undefined,
                                        unionGenerator.getReferenceToVisitorInterface(file)
                                    ),
                                ],
                                undefined,
                                ts.factory.createBlock(
                                    [
                                        ts.factory.createReturnStatement(
                                            ts.factory.createCallExpression(
                                                ts.factory.createPropertyAccessExpression(
                                                    unionGenerator.getReferenceToUnion(file).getExpression(),
                                                    UnionGenerator.VISIT_UTIL_PROPERTY_NAME
                                                ),
                                                undefined,
                                                [
                                                    ts.factory.createThis(),
                                                    ts.factory.createIdentifier(VISITOR_PARAMETER_NAME),
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

    private getDiscriminantKey(): string {
        return AbstractParsedSingleUnionType.getDiscriminantKey(this.getDiscriminant());
    }

    public static getDiscriminantKey(discriminant: WireStringWithAllCasings): string {
        return discriminant.camelCase;
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
                    UnionGenerator.VISITOR_PARAMETER_NAME
                ),
            ],
            undefined,
            undefined,
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(UnionGenerator.VISITOR_PARAMETER_NAME),
                    ts.factory.createIdentifier(this.getVisitorKey())
                ),
                undefined,
                this.singleUnionType.getVisitorArguments({ localReferenceToUnionValue })
            )
        );
    }

    public getVisitMethodSignature(file: SdkFile): ts.FunctionTypeNode {
        return AbstractParsedSingleUnionType.getVisitorPropertySignature({
            parameterType: this.singleUnionType.getVisitMethodParameterType(file),
        });
    }

    public static getVisitorPropertySignature({
        parameterType,
    }: {
        parameterType: ts.TypeNode | undefined;
    }): ts.FunctionTypeNode {
        return ts.factory.createFunctionTypeNode(
            undefined,
            parameterType != null
                ? [
                      ts.factory.createParameterDeclaration(
                          undefined,
                          undefined,
                          undefined,
                          UnionGenerator.VISITEE_PARAMETER_NAME,
                          undefined,
                          parameterType
                      ),
                  ]
                : [],
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(UnionGenerator.VISITOR_RETURN_TYPE))
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

    public abstract getDocs(): string | null | undefined;
    public abstract getDiscriminantValue(): string;
    public abstract getInterfaceName(): string;
    public abstract getBuilderName(): string;
    public abstract getVisitorKey(): string;
    protected abstract getDiscriminant(): WireStringWithAllCasings;
}
