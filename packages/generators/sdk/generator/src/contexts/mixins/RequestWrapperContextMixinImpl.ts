import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpointId } from "@fern-fern/ir-model/services/http";
import { RequestWrapperContextMixin } from "@fern-typescript/contexts";
import { GeneratedRequestWrapper } from "@fern-typescript/contexts/src/generated-types/GeneratedRequestWrapper";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { ServiceResolver } from "@fern-typescript/resolvers";
import { RequestWrapperDeclarationReferencer } from "../../declaration-referencers/RequestWrappedDeclarationReferencer";

export declare namespace RequestWrapperContextMixinImpl {
    export interface Init {
        requestWrapperGenerator: RequestWrapperGenerator;
        requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
        serviceResolver: ServiceResolver;
    }
}

export class RequestWrapperContextMixinImpl implements RequestWrapperContextMixin {
    private requestWrapperGenerator: RequestWrapperGenerator;
    private requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
    private serviceResolver: ServiceResolver;

    constructor({
        requestWrapperGenerator,
        requestWrapperDeclarationReferencer,
        serviceResolver,
    }: RequestWrapperContextMixinImpl.Init) {
        this.requestWrapperGenerator = requestWrapperGenerator;
        this.requestWrapperDeclarationReferencer = requestWrapperDeclarationReferencer;
        this.serviceResolver = serviceResolver;
    }

    public getGeneratedRequestWrapper(
        serviceName: DeclaredServiceName,
        endpointId: HttpEndpointId
    ): GeneratedRequestWrapper {
        const service = this.serviceResolver.getServiceDeclarationFromName(serviceName);
        if (service.originalService == null) {
            throw new Error("Service is a wrapper");
        }
        const endpoint = service.originalService.endpoints.find((endpoint) => endpoint.id === endpointId);
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointId} does not exist`);
        }
        return this.requestWrapperGenerator.generateRequestWrapper({
            service: service.originalService,
            endpoint,
            wrapperName: this.requestWrapperDeclarationReferencer.getExportedName({
                serviceName: service.originalService.name,
                endpoint,
            }),
        });
    }
}
