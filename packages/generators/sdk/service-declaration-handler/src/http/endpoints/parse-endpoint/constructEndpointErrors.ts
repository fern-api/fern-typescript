import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ResponseError } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { getTextOfTsNode, getWriterForMultiLineUnionType, visitorUtils } from "@fern-typescript/commons";
import { createPropertyAssignment } from "@fern-typescript/commons-v2";
import { TsNodeMaybeWithDocs } from "@fern-typescript/commons/src/writers/getWriterForMultiLineUnionType";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignature, PropertySignatureStructure, ts } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { generateReturnErrorResponse } from "../endpoint-method-body/generateReturnErrorResponse";
import { ClientEndpointError } from "./ParsedClientEndpoint";

interface ServerErrors {
    errors: ServerError[];
    referenceToErrorBodyType: ts.TypeReferenceNode;
}

interface ServerError {
    responseError: ResponseError;
    declaration: ErrorDeclaration;
    visitableItem: visitorUtils.VisitableItem;
}

export function constructEndpointErrors({
    endpoint,
    endpointFile,
    addEndpointUtil,
}: {
    endpoint: HttpEndpoint;
    endpointFile: SdkFile;
    addEndpointUtil: (util: ts.ObjectLiteralElementLike) => void;
}): ClientEndpointError {
    const errorType = endpointFile.sourceFile.addInterface({
        name: "Error",
        isExported: true,
    });

    const referenceToErrorType = ts.factory.createTypeReferenceNode(errorType.getName());

    const serverErrors = parseServerErrors({
        endpoint,
        endpointFile,
    });

    const errorBodyProperty = errorType.addProperty(
        getErrorBodyProperty({ referenceToErrorBodyType: serverErrors?.referenceToErrorBodyType, endpointFile })
    );

    const networkErrorVisitableItem: visitorUtils.VisitableItem = {
        caseInSwitchStatement: ts.factory.createStringLiteral(
            endpointFile.externalDependencies.serviceUtils.NetworkError.ERROR_NAME
        ),
        keyInVisitor: "_network",
        visitorArgument: undefined,
    };

    const unknownVisitorArgument: visitorUtils.Argument = {
        name: "details",
        type: endpointFile.externalDependencies.serviceUtils.ErrorDetails._getReferenceToType(),
        argument: ts.factory.createObjectLiteralExpression(
            [
                createPropertyAssignment(
                    endpointFile.externalDependencies.serviceUtils.ErrorDetails.STATUS_CODE,
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.RESPONSE),
                        endpointFile.externalDependencies.serviceUtils.Fetcher.ServerResponse.STATUS_CODE
                    )
                ),
            ],
            false
        ),
    };

    const visitableItemsForServerErrors: visitorUtils.VisitableItem[] = [];
    if (serverErrors != null) {
        visitableItemsForServerErrors.push(...serverErrors.errors.map((error) => error.visitableItem));
    }
    visitableItemsForServerErrors.push(networkErrorVisitableItem);
    const visitorInterface = endpointFile.sourceFile.addInterface(
        visitorUtils.generateVisitorInterface({
            items: {
                items: visitableItemsForServerErrors,
                unknownArgument: unknownVisitorArgument,
            },
            name: `${errorType.getName()}Visitor`,
        })
    );

    const visitProperty = errorType.addProperty({
        name: "_visit",
        type: getTextOfTsNode(
            visitorUtils.generateVisitMethodType(ts.factory.createIdentifier(visitorInterface.getName()))
        ),
    });

    if (serverErrors != null) {
        addEndpointUtil(
            createPropertyAssignment(
                ClientConstants.HttpService.Endpoint.Utils.ERROR_PARSER,
                constructErrorParser({
                    endpointFile,
                    serverErrors,
                    errorBodyProperty,
                    referenceToErrorType,
                })
            )
        );
    }

    const referenceToErrorParser = ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Utils.ERROR_PARSER);

    return {
        reference: referenceToErrorType,
        generateConstructServerErrorStatements: () =>
            generateConstructServerErrorStatements({
                endpointFile,
                referenceToErrorParser,
                serverErrors,
                unknownVisitorArgument,
                errorBodyProperty,
            }),
        generateConstructNetworkErrorBody: () =>
            generateConstructNetworkErrorBody({
                endpointFile,
                errorBodyProperty,
                visitProperty,
                networkErrorVisitableItem,
            }),
    };
}

function parseServerErrors({
    endpoint,
    endpointFile,
}: {
    endpoint: HttpEndpoint;
    endpointFile: SdkFile;
}): ServerErrors | undefined {
    const serverErrors = endpoint.errors.map((error) => {
        const errorDeclaration = endpointFile.getErrorDeclaration(error.error);
        const referenceToErrorBodyType = endpointFile.getReferenceToError(error.error).typeNode;
        return {
            responseError: error,
            declaration: errorDeclaration,
            visitableItem: {
                caseInSwitchStatement: ts.factory.createStringLiteral(errorDeclaration.discriminantValue.wireValue),
                keyInVisitor: errorDeclaration.discriminantValue.camelCase,
                visitorArgument: {
                    argument: ts.factory.createAsExpression(
                        ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                        referenceToErrorBodyType
                    ),
                    type: referenceToErrorBodyType,
                },
            },
        };
    });

    if (serverErrors.length === 0) {
        return undefined;
    }

    const errorBodyType = endpointFile.sourceFile.addTypeAlias({
        name: "ErrorBody",
        isExported: true,
        type: getWriterForMultiLineUnionType(
            endpoint.errors.map((error) => ({
                node: endpointFile.getReferenceToError(error.error).typeNode,
                docs: error.docs,
            }))
        ),
    });

    return {
        errors: serverErrors,
        referenceToErrorBodyType: ts.factory.createTypeReferenceNode(errorBodyType.getName()),
    };
}

function getErrorBodyProperty({
    referenceToErrorBodyType,
    endpointFile,
}: {
    referenceToErrorBodyType: ts.TypeNode | undefined;
    endpointFile: SdkFile;
}): OptionalKind<PropertySignatureStructure> {
    const errorBodySubTypes: TsNodeMaybeWithDocs[] = [];
    if (referenceToErrorBodyType != null) {
        errorBodySubTypes.push({
            docs: undefined,
            node: referenceToErrorBodyType,
        });
    }
    errorBodySubTypes.push(
        {
            docs: undefined,
            node: endpointFile.externalDependencies.serviceUtils.NetworkError._getReferenceToType(),
        },
        {
            docs: undefined,
            node: endpointFile.externalDependencies.serviceUtils.UnknownError._getReferenceToType(),
        }
    );
    return {
        name: "body",
        type: getWriterForMultiLineUnionType(errorBodySubTypes),
    };
}

function constructErrorParser({
    endpointFile,
    serverErrors,
    errorBodyProperty,
    referenceToErrorType,
}: {
    endpointFile: SdkFile;
    serverErrors: ServerErrors;
    errorBodyProperty: PropertySignature;
    referenceToErrorType: ts.TypeReferenceNode;
}): ts.Expression {
    return ts.factory.createArrowFunction(
        undefined,
        undefined,
        [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                visitorUtils.VALUE_PARAMETER_NAME,
                undefined,
                serverErrors.referenceToErrorBodyType
            ),
        ],
        referenceToErrorType,
        undefined,
        ts.factory.createParenthesizedExpression(
            ts.factory.createObjectLiteralExpression(
                [
                    createPropertyAssignment(
                        errorBodyProperty.getName(),
                        ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME)
                    ),
                    createPropertyAssignment(
                        visitorUtils.VISIT_PROPERTY_NAME,
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
                                    undefined,
                                    undefined
                                ),
                            ],
                            undefined,
                            undefined,
                            ts.factory.createBlock(
                                [
                                    ts.factory.createSwitchStatement(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                                            endpointFile.fernConstants.errorDiscriminant
                                        ),
                                        ts.factory.createCaseBlock(
                                            visitorUtils.generateVisitSwitchCaseClauses(
                                                serverErrors.errors.map((error) => error.visitableItem)
                                            )
                                        )
                                    ),
                                ],
                                true
                            )
                        )
                    ),
                ],
                true
            )
        )
    );
}

function generateConstructNetworkErrorBody({
    endpointFile,
    errorBodyProperty,
    visitProperty,
    networkErrorVisitableItem,
}: {
    endpointFile: SdkFile;
    errorBodyProperty: PropertySignature;
    visitProperty: PropertySignature;
    networkErrorVisitableItem: visitorUtils.VisitableItem;
}) {
    return ts.factory.createObjectLiteralExpression(
        [
            createPropertyAssignment(
                errorBodyProperty.getName(),
                ts.factory.createObjectLiteralExpression([
                    createPropertyAssignment(
                        ts.factory.createIdentifier(endpointFile.fernConstants.errorDiscriminant),
                        ts.factory.createStringLiteral(
                            endpointFile.externalDependencies.serviceUtils.NetworkError.ERROR_NAME
                        )
                    ),
                ])
            ),
            createPropertyAssignment(
                visitProperty.getName(),
                ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(visitorUtils.VISITOR_PARAMETER_NAME),
                            undefined,
                            undefined,
                            undefined
                        ),
                    ],
                    undefined,
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(visitorUtils.VISITOR_PARAMETER_NAME),
                            networkErrorVisitableItem.keyInVisitor
                        ),
                        undefined,
                        []
                    )
                )
            ),
        ],
        true
    );
}

function generateConstructServerErrorStatements({
    endpointFile,
    referenceToErrorParser,
    serverErrors,
    unknownVisitorArgument,
    errorBodyProperty,
}: {
    endpointFile: SdkFile;
    referenceToErrorParser: ts.Expression;
    serverErrors: ServerErrors | undefined;
    unknownVisitorArgument: visitorUtils.Argument;
    errorBodyProperty: PropertySignature;
}) {
    const returnUnknownError = generateReturnErrorResponse({
        file: endpointFile,
        body: ts.factory.createObjectLiteralExpression(
            [
                ts.factory.createPropertyAssignment(
                    errorBodyProperty.getName(),
                    ts.factory.createAsExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.RESPONSE),
                            endpointFile.externalDependencies.serviceUtils.Fetcher.Response.BODY
                        ),
                        endpointFile.externalDependencies.serviceUtils.UnknownError._getReferenceToType()
                    )
                ),
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier(visitorUtils.VISIT_PROPERTY_NAME),
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
                                undefined,
                                undefined
                            ),
                        ],
                        undefined,
                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(visitorUtils.VISITOR_PARAMETER_NAME),
                                ts.factory.createIdentifier(visitorUtils.UNKNOWN_PROPERY_NAME)
                            ),
                            undefined,
                            [unknownVisitorArgument.argument]
                        )
                    )
                ),
            ],
            true
        ),
    });

    if (serverErrors == null) {
        return returnUnknownError;
    }

    return ts.factory.createSwitchStatement(
        ts.factory.createPropertyAccessChain(
            ts.factory.createParenthesizedExpression(
                ts.factory.createAsExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.RESPONSE),
                        endpointFile.externalDependencies.serviceUtils.Fetcher.Response.BODY
                    ),
                    serverErrors.referenceToErrorBodyType
                )
            ),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            endpointFile.fernConstants.errorDiscriminant
        ),
        ts.factory.createCaseBlock([
            ...getServerErrorCaseStatements({
                serverErrors,
                referenceToErrorParser,
                endpointFile,
            }),
            ts.factory.createDefaultClause([returnUnknownError]),
        ])
    );
}

function getServerErrorCaseStatements({
    serverErrors,
    referenceToErrorParser,
    endpointFile,
}: {
    serverErrors: ServerErrors;
    referenceToErrorParser: ts.Expression;
    endpointFile: SdkFile;
}): ts.CaseClause[] {
    const lastServerError = serverErrors.errors[serverErrors.errors.length - 1];
    if (lastServerError == null) {
        return [];
    }
    return [
        ...serverErrors.errors
            .slice(0, -1)
            .map((error) => ts.factory.createCaseClause(error.visitableItem.caseInSwitchStatement, [])),
        ts.factory.createCaseClause(lastServerError.visitableItem.caseInSwitchStatement, [
            generateReturnErrorResponse({
                file: endpointFile,
                body: ts.factory.createCallExpression(referenceToErrorParser, undefined, [
                    ts.factory.createAsExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.RESPONSE),
                            endpointFile.externalDependencies.serviceUtils.Fetcher.Response.BODY
                        ),
                        serverErrors.referenceToErrorBodyType
                    ),
                ]),
            }),
        ]),
    ];
}
