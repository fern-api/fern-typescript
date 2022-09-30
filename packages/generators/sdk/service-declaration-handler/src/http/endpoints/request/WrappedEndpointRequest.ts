import { PathParameter, QueryParameter } from "@fern-fern/ir-model/services/http";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { AbstractEndpointDeclaration } from "../AbstractEndpointDeclaration";
import { AbstractEndpointRequest } from "./AbstractEndpointRequest";

interface ParsedQueryParam {
    keyInWrapper: string;
    queryParameter: QueryParameter;
}

interface ParsedPathParam {
    keyInWrapper: string;
    pathParameter: PathParameter;
}

export class WrappedEndpointRequest extends AbstractEndpointRequest {
    private static REQUEST_WRAPPER_INTERFACE_NAME = "Request";
    private static REQUEST_BODY_PROPERTY_NAME = "_body";
    private static QUERY_PARAMETERS_VARIABLE_NAME = "queryParameters";

    private parsedQueryParameters: ParsedQueryParam[] = [];
    private parsedPathParameters: ParsedPathParam[] = [];

    constructor(init: AbstractEndpointDeclaration.Init) {
        super(init);

        this.parsedQueryParameters = this.endpoint.queryParameters.map((queryParameter) => ({
            keyInWrapper: queryParameter.name.camelCase,
            queryParameter,
        }));
        this.parsedPathParameters = this.endpoint.pathParameters.map((pathParameter) => ({
            keyInWrapper: pathParameter.name.camelCase,
            pathParameter,
        }));
    }

    protected override getRequestParameterType(file: SdkFile): TypeReferenceNode {
        const typeNode = ts.factory.createTypeReferenceNode(
            this.getReferenceToEndpointFileType(WrappedEndpointRequest.REQUEST_WRAPPER_INTERFACE_NAME, file)
        );
        return {
            isOptional: false,
            typeNode,
        };
    }

    protected override getReferenceToRequestBodyInsideEndpoint(): ts.Expression {
        return this.getReferenceToWrapperProperty(WrappedEndpointRequest.REQUEST_BODY_PROPERTY_NAME);
    }

    private getReferenceToWrapperProperty(propertyName: string): ts.Expression {
        return ts.factory.createPropertyAccessExpression(this.getReferenceToRequestArgumentToEndpoint(), propertyName);
    }

    protected override getUrlPath(): ts.Expression {
        if (this.parsedPathParameters.length === 0) {
            return this.getUrlPathForNoPathParameters();
        }

        return ts.factory.createTemplateExpression(
            ts.factory.createTemplateHead(this.endpoint.path.head),
            this.endpoint.path.parts.map((part, index) => {
                const parsedPathParameter = this.parsedPathParameters.find(
                    ({ pathParameter }) => pathParameter.name.originalValue === part.pathParameter
                );
                if (parsedPathParameter == null) {
                    throw new Error("Path parameter does not exist: " + part.pathParameter);
                }
                return ts.factory.createTemplateSpan(
                    this.getReferenceToWrapperProperty(parsedPathParameter.keyInWrapper),
                    index === this.endpoint.path.parts.length - 1
                        ? ts.factory.createTemplateTail(part.tail)
                        : ts.factory.createTemplateMiddle(part.tail)
                );
            })
        );
    }

    protected override buildQueryParameters(
        file: SdkFile
    ): { statements: ts.Statement[]; referenceToUrlParams: ts.Expression } | undefined {
        if (this.parsedQueryParameters.length === 0) {
            return undefined;
        }

        const urlParamsVariable = ts.factory.createIdentifier(WrappedEndpointRequest.QUERY_PARAMETERS_VARIABLE_NAME);
        const statements: ts.Statement[] = [];

        // create URLSearchParams
        statements.push(
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            urlParamsVariable,
                            undefined,
                            undefined,
                            ts.factory.createNewExpression(
                                ts.factory.createIdentifier("URLSearchParams"),
                                undefined,
                                []
                            )
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            )
        );

        for (const { queryParameter, keyInWrapper } of this.parsedQueryParameters) {
            const queryParameterReference = this.getReferenceToWrapperProperty(keyInWrapper);

            const queryParameterAsString = file.convertExpressionToString(
                queryParameterReference,
                queryParameter.valueType
            );

            const appendStatement = ts.factory.createExpressionStatement(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(urlParamsVariable, ts.factory.createIdentifier("append")),
                    undefined,
                    [ts.factory.createStringLiteral(queryParameter.name.wireValue), queryParameterAsString.expression]
                )
            );

            if (queryParameterAsString.isNullable) {
                statements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createBinaryExpression(
                            queryParameterReference,
                            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                            ts.factory.createNull()
                        ),
                        ts.factory.createBlock([appendStatement])
                    )
                );
            } else {
                statements.push(appendStatement);
            }
        }

        return {
            statements,
            referenceToUrlParams: urlParamsVariable,
        };
    }

    protected override generateTypeDeclaration(file: SdkFile): void {
        const properties: OptionalKind<PropertySignatureStructure>[] = [];

        for (const { keyInWrapper, queryParameter } of this.parsedQueryParameters) {
            const type = file.getReferenceToType(queryParameter.valueType);
            properties.push({
                name: keyInWrapper,
                type: getTextOfTsNode(type.isOptional ? type.typeNodeWithoutUndefined : type.typeNode),
                hasQuestionToken: type.isOptional,
            });
        }

        for (const { keyInWrapper, pathParameter } of this.parsedPathParameters) {
            const type = file.getReferenceToType(pathParameter.valueType);
            properties.push({
                name: keyInWrapper,
                type: getTextOfTsNode(type.isOptional ? type.typeNodeWithoutUndefined : type.typeNode),
                hasQuestionToken: type.isOptional,
            });
        }

        // TODO headers
        // TODO auth?

        if (this.hasRequestBody()) {
            const type = file.getReferenceToType(this.endpoint.request.type);
            properties.push({
                name: WrappedEndpointRequest.REQUEST_BODY_PROPERTY_NAME,
                type: getTextOfTsNode(type.isOptional ? type.typeNodeWithoutUndefined : type.typeNode),
                hasQuestionToken: type.isOptional,
            });
        }

        file.sourceFile.addInterface({
            name: WrappedEndpointRequest.REQUEST_WRAPPER_INTERFACE_NAME,
            isExported: true,
            properties,
        });
    }
}
