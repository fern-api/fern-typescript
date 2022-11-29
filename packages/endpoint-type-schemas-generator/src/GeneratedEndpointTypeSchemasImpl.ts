import { ResponseErrorShape } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { EndpointTypeSchemasContext, GeneratedEndpointTypeSchemas } from "@fern-typescript/sdk-declaration-handler";
import {
    GeneratedUnionSchema,
    RawNoPropertiesSingleUnionType,
    RawSingleUnionType,
} from "@fern-typescript/union-schema-generator";
import { EndpointTypesContextImpl } from "./EndpointTypesContextImpl";
import { RawSinglePropertyErrorSingleUnionType } from "./RawSinglePropertyErrorSingleUnionType";

export declare namespace GeneratedEndpointTypeSchemasImpl {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
    }
}

export class GeneratedEndpointTypeSchemasImpl implements GeneratedEndpointTypeSchemas {
    private static ERROR_SCHEMA_NAME = "Error";

    public readonly type = "union";

    private generatedErrorUnionSchema: GeneratedUnionSchema<EndpointTypeSchemasContext>;

    constructor({ endpoint }: GeneratedEndpointTypeSchemasImpl.Init) {
        const discriminant = endpoint.errorsV2.discriminant;
        this.generatedErrorUnionSchema = new GeneratedUnionSchema<EndpointTypeSchemasContext>({
            discriminant,
            getParsedDiscriminant: (context) => context.getEndpointTypesBeingGenerated().getErrorUnion().discriminant,
            getReferenceToParsedUnion: (context) =>
                context
                    .getEndpointTypesBeingGenerated()
                    .getErrorUnion()
                    .getReferenceTo(new EndpointTypesContextImpl({ endpointTypeSchemaContext: context })),
            buildParsedUnion: ({ discriminantValueToBuild, existingValue, context }) =>
                context
                    .getEndpointTypesBeingGenerated()
                    .getErrorUnion()
                    .buildFromExistingValue({
                        discriminantValueToBuild,
                        existingValue,
                        context: new EndpointTypesContextImpl({ endpointTypeSchemaContext: context }),
                    }),
            singleUnionTypes: endpoint.errorsV2.types.map((responseError) =>
                ResponseErrorShape._visit<RawSingleUnionType<EndpointTypeSchemasContext>>(responseError.shape, {
                    singleProperty: (errorProperty) =>
                        new RawSinglePropertyErrorSingleUnionType({
                            responseError,
                            errorProperty,
                            discriminant,
                            discriminantValue: responseError.discriminantValue,
                        }),
                    noProperties: () =>
                        new RawNoPropertiesSingleUnionType({
                            discriminant,
                            discriminantValue: responseError.discriminantValue,
                        }),
                    _unknown: () => {
                        throw new Error("Unknown ResponseErrorShape type: " + responseError.shape.type);
                    },
                })
            ),
            typeName: GeneratedEndpointTypeSchemasImpl.ERROR_SCHEMA_NAME,
        });
    }

    public writeToFile(context: EndpointTypeSchemasContext): void {
        this.generatedErrorUnionSchema.writeSchemaToFile(context);
    }
}
