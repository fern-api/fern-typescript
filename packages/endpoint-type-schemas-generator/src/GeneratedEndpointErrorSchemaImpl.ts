import { ErrorDiscriminationByPropertyStrategy } from "@fern-fern/ir-model/ir";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { Zurg } from "@fern-typescript/commons-v2";
import { EndpointTypeSchemasContext, EndpointTypesContext, GeneratedUnion } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedUnionSchema, RawNoPropertiesSingleUnionType } from "@fern-typescript/union-schema-generator";
import { ts } from "ts-morph";
import { GeneratedEndpointErrorSchema } from "./GeneratedEndpointErrorSchema";
import { RawSinglePropertyErrorSingleUnionType } from "./RawSinglePropertyErrorSingleUnionType";

export declare namespace GeneratedEndpointErrorSchemaImpl {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
        errorResolver: ErrorResolver;
        discriminationStrategy: ErrorDiscriminationByPropertyStrategy;
    }
}

export class GeneratedEndpointErrorSchemaImpl implements GeneratedEndpointErrorSchema {
    private static ERROR_SCHEMA_NAME = "Error";

    private service: HttpService;
    private endpoint: HttpEndpoint;
    private generatedErrorUnionSchema: GeneratedUnionSchema<EndpointTypeSchemasContext>;

    constructor({ service, endpoint, errorResolver, discriminationStrategy }: GeneratedEndpointErrorSchemaImpl.Init) {
        this.service = service;
        this.endpoint = endpoint;

        this.generatedErrorUnionSchema = new GeneratedUnionSchema<EndpointTypeSchemasContext>({
            typeName: GeneratedEndpointErrorSchemaImpl.ERROR_SCHEMA_NAME,
            shouldIncludeDefaultCaseInTransform: false,
            discriminant: discriminationStrategy.discriminant,
            getReferenceToSchema: (context) =>
                context.endpointTypeSchemas.getReferenceToEndpointTypeSchemaExport(
                    service.name,
                    endpoint.id,
                    GeneratedEndpointErrorSchemaImpl.ERROR_SCHEMA_NAME
                ),
            getGeneratedUnion: (context) => this.getErrorUnion(context),
            singleUnionTypes: endpoint.errors.map((responseError) => {
                const errorDeclaration = errorResolver.getErrorDeclarationFromName(responseError.error);
                if (errorDeclaration.typeV2 == null) {
                    return new RawNoPropertiesSingleUnionType({
                        discriminant: discriminationStrategy.discriminant,
                        discriminantValue: errorDeclaration.discriminantValueV4,
                    });
                } else {
                    return new RawSinglePropertyErrorSingleUnionType({
                        discriminant: discriminationStrategy.discriminant,
                        discriminantValue: errorDeclaration.discriminantValueV4,
                        errorName: responseError.error,
                    });
                }
            }),
        });
    }

    public writeToFile(context: EndpointTypeSchemasContext): void {
        this.generatedErrorUnionSchema.writeSchemaToFile(context);
    }

    public getReferenceToRawShape(context: EndpointTypeSchemasContext): ts.TypeNode {
        return this.generatedErrorUnionSchema.getReferenceToRawShape(context);
    }

    public getReferenceToZurgSchema(context: EndpointTypeSchemasContext): Zurg.Schema {
        return this.generatedErrorUnionSchema.getReferenceToZurgSchema(context);
    }

    private getErrorUnion(context: EndpointTypeSchemasContext): GeneratedUnion<EndpointTypesContext> {
        return context.endpointTypes.getGeneratedEndpointTypes(this.service.name, this.endpoint.id).getErrorUnion();
    }
}
