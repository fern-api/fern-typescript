import { ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { EndpointTypesContext, GeneratedEndpointTypes, GeneratedUnion } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedUnionImpl } from "@fern-typescript/union-generator";
import { ts } from "ts-morph";
import { ParsedSingleUnionTypeForError } from "./error/ParsedSingleUnionTypeForError";
import { UnknownErrorSingleUnionType } from "./error/UnknownErrorSingleUnionType";
import { UnknownErrorSingleUnionTypeGenerator } from "./error/UnknownErrorSingleUnionTypeGenerator";

export declare namespace GeneratedEndpointTypesImpl {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    }
}

export class GeneratedEndpointTypesImpl implements GeneratedEndpointTypes {
    private static RESPONSE_INTERFACE_NAME = "Response";
    private static ERROR_INTERFACE_NAME = "Error";
    private static STATUS_CODE_DISCRIMINANT = "statusCode";

    private service: HttpService;
    private endpoint: HttpEndpoint;
    private errorUnion: GeneratedUnionImpl<EndpointTypesContext>;

    constructor({ service, endpoint, errorResolver, errorDiscriminationStrategy }: GeneratedEndpointTypesImpl.Init) {
        this.service = service;
        this.endpoint = endpoint;

        const unknownErrorSingleUnionTypeGenerator = new UnknownErrorSingleUnionTypeGenerator();
        this.errorUnion = new GeneratedUnionImpl<EndpointTypesContext>({
            typeName: GeneratedEndpointTypesImpl.ERROR_INTERFACE_NAME,
            discriminant: this.getErrorUnionDiscriminant(errorDiscriminationStrategy),
            getDocs: undefined,
            parsedSingleUnionTypes: endpoint.errors.map(
                (error) => new ParsedSingleUnionTypeForError({ error, errorResolver, errorDiscriminationStrategy })
            ),
            getReferenceToUnion: (context) =>
                context.endpointTypes.getReferenceToEndpointTypeExport(
                    service.name,
                    this.endpoint.id,
                    GeneratedEndpointTypesImpl.ERROR_INTERFACE_NAME
                ),
            unknownSingleUnionType: new UnknownErrorSingleUnionType({
                singleUnionType: unknownErrorSingleUnionTypeGenerator,
                builderParameterName: unknownErrorSingleUnionTypeGenerator.getBuilderParameterName(),
            }),
        });
    }

    private getErrorUnionDiscriminant(errorDiscriminationStrategy: ErrorDiscriminationStrategy): string {
        return ErrorDiscriminationStrategy._visit(errorDiscriminationStrategy, {
            property: ({ discriminant }) => discriminant.name.unsafeName.camelCase,
            statusCode: () => GeneratedEndpointTypesImpl.STATUS_CODE_DISCRIMINANT,
            _unknown: () => {
                throw new Error("Unknown error discrimination strategy: " + errorDiscriminationStrategy.type);
            },
        });
    }

    public writeToFile(context: EndpointTypesContext): void {
        this.writeResponseToFile(context);
        this.errorUnion.writeToFile(context);
    }

    public getErrorUnion(): GeneratedUnion<EndpointTypesContext> {
        return this.errorUnion;
    }

    public getReferenceToResponseType(context: EndpointTypesContext): ts.TypeNode {
        return context.endpointTypes
            .getReferenceToEndpointTypeExport(
                this.service.name,
                this.endpoint.id,
                GeneratedEndpointTypesImpl.RESPONSE_INTERFACE_NAME
            )
            .getTypeNode();
    }

    private writeResponseToFile(context: EndpointTypesContext): void {
        context.base.sourceFile.addTypeAlias({
            name: GeneratedEndpointTypesImpl.RESPONSE_INTERFACE_NAME,
            isExported: true,
            type: getTextOfTsNode(
                context.base.coreUtilities.fetcher.APIResponse._getReferenceToType(
                    this.endpoint.response.typeV2 == null
                        ? ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                        : context.type.getReferenceToType(this.endpoint.response.typeV2).typeNode,
                    this.errorUnion.getReferenceTo(context)
                )
            ),
        });
    }
}
