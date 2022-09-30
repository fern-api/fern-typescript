import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { constructEndpointErrors } from "./constructEndpointErrors";
import { constructRequestWrapper } from "./constructRequestWrapper";
import { getReferenceToMaybeVoidType } from "./getReferenceToMaybeVoidType";
import { ClientEndpointRequest, ParsedClientEndpoint } from "./ParsedClientEndpoint";

export function parseEndpoint({
    serviceName,
    endpoint,
    endpointFile,
}: {
    serviceName: DeclaredServiceName;
    endpoint: HttpEndpoint;
    endpointFile: SdkFile;
    schemaFile: SdkFile;
}): ParsedClientEndpoint {
    const endpointUtils: ts.ObjectLiteralElementLike[] = [];

    const parsedEndpoint: ParsedClientEndpoint = {
        endpointMethodName: endpoint.name.camelCase,
        path: endpoint.path,
        method: endpoint.method,
        request: parseRequest({ serviceName, endpoint, endpointFile }),
        referenceToResponse: getReferenceToMaybeVoidType(endpoint.response.type, endpointFile),
        error: constructEndpointErrors({
            endpoint,
            endpointFile,
            addEndpointUtil: (util) => {
                endpointUtils.push(util);
            },
        }),
    };

    return parsedEndpoint;
}

function parseRequest({
    serviceName,
    endpoint,
    endpointFile,
}: {
    serviceName: DeclaredServiceName;
    endpoint: HttpEndpoint;
    endpointFile: SdkFile;
}): ClientEndpointRequest | undefined {
    if (
        endpoint.pathParameters.length === 0 &&
        endpoint.queryParameters.length === 0 &&
        endpoint.headers.length === 0
    ) {
        const referenceToBody = getReferenceToMaybeVoidType(endpoint.request.type, endpointFile);
        if (referenceToBody == null) {
            return undefined;
        }

        return {
            isWrapped: false,
            referenceToBody,
        };
    }

    const wrapper = constructRequestWrapper({ serviceName, endpoint, endpointFile });

    return {
        isWrapped: true,
        ...wrapper,
    };
}
