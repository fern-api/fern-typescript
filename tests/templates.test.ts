/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernInternal from "../src/api/index";
import { FernInternalClient } from "../src/Client";

const client = new FernInternalClient({
    environment: process.env.TESTS_BASE_URL || "test",
    token: process.env.TESTS_AUTH || "test",
});

describe("Templates", () => {
    test("register", async () => {
        const response = await client.templates.register({
            orgId: "string",
            apiId: "string",
            apiDefinitionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            snippet: {
                sdk: {
                    type: "typescript",
                    package: "string",
                    version: "string",
                },
                endpointId: {
                    path: "string",
                    method: FernInternal.EndpointMethod.Put,
                },
                snippetTemplate: {
                    type: "v1",
                    clientInstantiation: "string",
                    functionInvocation: {
                        type: "generic",
                        imports: ["string"],
                        isOptional: true,
                        templateString: "string",
                        templateInputs: [
                            {
                                type: "template",
                                value: {
                                    key: "value",
                                },
                            },
                        ],
                        inputDelimiter: "string",
                    },
                },
            },
        });
        expect(response).toEqual(undefined);
    });

    test("registerBatch", async () => {
        const response = await client.templates.registerBatch({
            orgId: "string",
            apiId: "string",
            apiDefinitionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            snippets: [
                {
                    sdk: {
                        type: "typescript",
                        package: "string",
                        version: "string",
                    },
                    endpointId: {
                        path: "string",
                        method: FernInternal.EndpointMethod.Put,
                    },
                    snippetTemplate: {
                        type: "v1",
                        clientInstantiation: "string",
                        functionInvocation: {
                            type: "generic",
                            imports: ["string"],
                            isOptional: true,
                            templateString: "string",
                            templateInputs: [
                                {
                                    type: "template",
                                    value: {
                                        key: "value",
                                    },
                                },
                            ],
                            inputDelimiter: "string",
                        },
                    },
                },
            ],
        });
        expect(response).toEqual(undefined);
    });

    test("get", async () => {
        const response = await client.templates.get({
            orgId: "string",
            apiId: "string",
            sdk: {
                type: "typescript",
                package: "string",
                version: "string",
            },
            endpointId: {
                path: "string",
                method: FernInternal.EndpointMethod.Put,
            },
        });
        expect(response).toEqual({
            sdk: { type: "typescript", package: "string", version: "string" },
            endpointId: { path: "string", method: "PUT" },
            snippetTemplate: {
                type: "v1",
                clientInstantiation: "string",
                functionInvocation: {
                    type: "generic",
                    imports: ["string"],
                    isOptional: true,
                    templateString: "string",
                    templateInputs: [{ type: "template", key: "value" }],
                    inputDelimiter: "string",
                },
            },
        });
    });
});
