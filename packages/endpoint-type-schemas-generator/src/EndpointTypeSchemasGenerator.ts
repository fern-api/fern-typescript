import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { GeneratedEndpointTypeSchemas } from "@fern-typescript/sdk-declaration-handler";
import { GeneratedEndpointTypeSchemasImpl } from "./GeneratedEndpointTypeSchemasImpl";

export declare namespace EndpointTypeSchemasGenerator {
    export namespace generateEndpointTypeSchemas {
        export interface Args {
            service: HttpService;
            endpoint: HttpEndpoint;
        }
    }
}

export class EndpointTypeSchemasGenerator {
    public generateEndpointTypeSchemas({
        service,
        endpoint,
    }: EndpointTypeSchemasGenerator.generateEndpointTypeSchemas.Args): GeneratedEndpointTypeSchemas {
        return new GeneratedEndpointTypeSchemasImpl({ service, endpoint });
    }
}
