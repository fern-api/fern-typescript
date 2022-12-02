import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { TypeReference } from "@fern-fern/ir-model/types";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { EndpointTypeSchemasContext, Reference } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";

export declare namespace GeneratedTypeReferenceSchema {
    export interface Init extends AbstractGeneratedSchema.Init {
        service: HttpService;
        endpoint: HttpEndpoint;
        typeReference: TypeReference;
    }
}

export class GeneratedTypeReferenceSchema extends AbstractGeneratedSchema<EndpointTypeSchemasContext> {
    private service: HttpService;
    private endpoint: HttpEndpoint;
    private typeReference: TypeReference;

    constructor({ service, endpoint, typeReference, ...superInit }: GeneratedTypeReferenceSchema.Init) {
        super(superInit);
        this.service = service;
        this.endpoint = endpoint;
        this.typeReference = typeReference;
    }

    protected generateRawTypeDeclaration(context: EndpointTypeSchemasContext, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: this.typeName,
            type: getTextOfTsNode(context.typeSchema.getReferenceToRawType(this.typeReference).typeNode),
        });
    }

    protected getReferenceToParsedShape(context: EndpointTypeSchemasContext): ts.TypeNode {
        return context.type.getReferenceToType(this.typeReference).typeNode;
    }

    protected buildSchema(context: EndpointTypeSchemasContext): Zurg.Schema {
        return context.typeSchema.getSchemaOfTypeReference(this.typeReference);
    }

    protected getReferenceToSchema(context: EndpointTypeSchemasContext): Reference {
        return context.endpointTypeSchemas.getReferenceToEndpointTypeSchemaExport(this.service.name, this.endpoint.id, [
            this.typeName,
        ]);
    }
}
