import { HttpService } from "@fern-fern/ir-model/services/http";
import { getTextOfTsKeyword, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { Scope, ts } from "ts-morph";
import { ClientConstants } from "../constants";
import { ServiceDeclarationHandler } from "../ServiceDeclarationHandler";
import { Endpoint } from "./endpoints/parsed-endpoint/Endpoint";

export function generateHttpService({
    service: irService,
    serviceClassName,
    serviceFile,
    withEndpoint,
}: {
    service: HttpService;
    serviceClassName: string;
    serviceFile: SdkFile;
    withEndpoint: (endpointId: string, run: (args: ServiceDeclarationHandler.withEndpoint.Args) => void) => void;
}): void {
    const serviceInterface = serviceFile.sourceFile.addInterface({
        name: serviceClassName,
        isExported: true,
    });

    const serviceModule = serviceFile.sourceFile.addModule({
        name: serviceInterface.getName(),
        isExported: true,
        hasDeclareKeyword: true,
    });

    const optionsInterface = serviceModule.addInterface({
        name: ClientConstants.HttpService.ServiceNamespace.Options.TYPE_NAME,
        properties: [
            {
                name: ClientConstants.HttpService.ServiceNamespace.Options.Properties.BASE_PATH,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            },
        ],
    });

    optionsInterface.addProperties(serviceFile.authSchemes.getProperties());

    const serviceClass = serviceFile.sourceFile.addClass({
        name: serviceInterface.getName(),
        implements: [serviceInterface.getName()],
        isExported: true,
    });
    maybeAddDocs(serviceClass, irService.docs);

    serviceClass.addConstructor({
        parameters: [
            {
                name: ClientConstants.HttpService.PrivateMembers.OPTIONS,
                isReadonly: true,
                scope: Scope.Private,
                type: getTextOfTsNode(
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createQualifiedName(
                            ts.factory.createIdentifier(serviceModule.getName()),
                            ts.factory.createIdentifier(optionsInterface.getName())
                        )
                    )
                ),
            },
        ],
    });

    for (const irEndpoint of irService.endpoints) {
        withEndpoint(irEndpoint.id, ({ endpointFile, schemaFile }) => {
            const endpoint = new Endpoint({
                serviceName: irService.name,
                endpoint: irEndpoint,
                file: endpointFile,
            });
            endpoint.generate({ endpointFile, schemaFile });
            // TODO make a new class like Service() so we can do Service.getReferenceToOptions()
            serviceInterface.addMethod(endpoint.getSignature(serviceFile));
            serviceClass.addMethod(endpoint.getImplementation(serviceFile));
        });
    }
}
