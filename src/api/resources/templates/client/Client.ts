/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as environments from "../../../../environments";
import * as core from "../../../../core";
import * as Fern from "../../../index";
import urlJoin from "url-join";
import * as errors from "../../../../errors/index";

export declare namespace Templates {
    interface Options {
        environment?: core.Supplier<environments.FernEnvironment | string>;
        token?: core.Supplier<core.BearerToken | undefined>;
    }

    interface RequestOptions {
        timeoutInSeconds?: number;
        maxRetries?: number;
        abortSignal?: AbortSignal;
    }
}

export class Templates {
    constructor(protected readonly _options: Templates.Options = {}) {}

    /**
     * Store endpoint snippet for a particular SDK.
     *
     * @param {Fern.RegisterSnippetTemplateRequest} request
     * @param {Templates.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await fern.templates.register({
     *         orgId: "string",
     *         apiId: "string",
     *         apiDefinitionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
     *         snippet: {
     *             sdk: {
     *                 type: "typescript",
     *                 package: "string",
     *                 version: "string"
     *             },
     *             endpointId: {
     *                 path: "string",
     *                 method: Fern.EndpointMethod.Put,
     *                 identifierOverride: "string"
     *             },
     *             snippetTemplate: {
     *                 type: "v1",
     *                 clientInstantiation: "string",
     *                 functionInvocation: {
     *                     type: "generic",
     *                     imports: ["string"],
     *                     isOptional: true,
     *                     templateString: "string",
     *                     templateInputs: [{
     *                             type: "template",
     *                             value: {
     *                                 "key": "value"
     *                             }
     *                         }],
     *                     inputDelimiter: "string"
     *                 }
     *             },
     *             additionalTemplates: {
     *                 "string": {
     *                     type: "v1",
     *                     clientInstantiation: "string",
     *                     functionInvocation: {
     *                         type: "generic",
     *                         imports: ["string"],
     *                         isOptional: true,
     *                         templateString: "string",
     *                         templateInputs: [{
     *                                 type: "template",
     *                                 value: {
     *                                     "key": "value"
     *                                 }
     *                             }],
     *                         inputDelimiter: "string"
     *                     }
     *                 }
     *             }
     *         }
     *     })
     */
    public async register(
        request: Fern.RegisterSnippetTemplateRequest,
        requestOptions?: Templates.RequestOptions
    ): Promise<void> {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernEnvironment.Dev,
                "/snippet-template/register"
            ),
            method: "POST",
            headers: {
                Authorization: await this._getAuthorizationHeader(),
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "@fern-api/sdk",
                "X-Fern-SDK-Version": "0.5.0",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
            },
            contentType: "application/json",
            body: request,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return;
        }

        if (_response.error.reason === "status-code") {
            throw new errors.FernError({
                statusCode: _response.error.statusCode,
                body: _response.error.body,
            });
        }

        switch (_response.error.reason) {
            case "non-json":
                throw new errors.FernError({
                    statusCode: _response.error.statusCode,
                    body: _response.error.rawBody,
                });
            case "timeout":
                throw new errors.FernTimeoutError();
            case "unknown":
                throw new errors.FernError({
                    message: _response.error.errorMessage,
                });
        }
    }

    /**
     * Store endpoint snippets for a particular SDK.
     *
     * @param {Fern.RegisterSnippetTemplateBatchRequest} request
     * @param {Templates.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await fern.templates.registerBatch({
     *         orgId: "string",
     *         apiId: "string",
     *         apiDefinitionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
     *         snippets: [{
     *                 sdk: {
     *                     type: "typescript",
     *                     package: "string",
     *                     version: "string"
     *                 },
     *                 endpointId: {
     *                     path: "string",
     *                     method: Fern.EndpointMethod.Put,
     *                     identifierOverride: "string"
     *                 },
     *                 snippetTemplate: {
     *                     type: "v1",
     *                     clientInstantiation: "string",
     *                     functionInvocation: {
     *                         type: "generic",
     *                         imports: ["string"],
     *                         isOptional: true,
     *                         templateString: "string",
     *                         templateInputs: [{
     *                                 type: "template",
     *                                 value: {
     *                                     "key": "value"
     *                                 }
     *                             }],
     *                         inputDelimiter: "string"
     *                     }
     *                 },
     *                 additionalTemplates: {
     *                     "string": {
     *                         type: "v1",
     *                         clientInstantiation: "string",
     *                         functionInvocation: {
     *                             type: "generic",
     *                             imports: ["string"],
     *                             isOptional: true,
     *                             templateString: "string",
     *                             templateInputs: [{
     *                                     type: "template",
     *                                     value: {
     *                                         "key": "value"
     *                                     }
     *                                 }],
     *                             inputDelimiter: "string"
     *                         }
     *                     }
     *                 }
     *             }]
     *     })
     */
    public async registerBatch(
        request: Fern.RegisterSnippetTemplateBatchRequest,
        requestOptions?: Templates.RequestOptions
    ): Promise<void> {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernEnvironment.Dev,
                "/snippet-template/register/batch"
            ),
            method: "POST",
            headers: {
                Authorization: await this._getAuthorizationHeader(),
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "@fern-api/sdk",
                "X-Fern-SDK-Version": "0.5.0",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
            },
            contentType: "application/json",
            body: request,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return;
        }

        if (_response.error.reason === "status-code") {
            throw new errors.FernError({
                statusCode: _response.error.statusCode,
                body: _response.error.body,
            });
        }

        switch (_response.error.reason) {
            case "non-json":
                throw new errors.FernError({
                    statusCode: _response.error.statusCode,
                    body: _response.error.rawBody,
                });
            case "timeout":
                throw new errors.FernTimeoutError();
            case "unknown":
                throw new errors.FernError({
                    message: _response.error.errorMessage,
                });
        }
    }

    /**
     * Get the endpoint's snippet template for a particular SDK.
     *
     * @param {Fern.GetSnippetTemplate} request
     * @param {Templates.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link Fern.UnauthorizedError}
     * @throws {@link Fern.SnippetNotFound}
     *
     * @example
     *     await fern.templates.get({
     *         orgId: "string",
     *         apiId: "string",
     *         sdk: {
     *             type: "typescript",
     *             package: "string",
     *             version: "string"
     *         },
     *         endpointId: {
     *             path: "string",
     *             method: Fern.EndpointMethod.Put,
     *             identifierOverride: "string"
     *         }
     *     })
     */
    public async get(
        request: Fern.GetSnippetTemplate,
        requestOptions?: Templates.RequestOptions
    ): Promise<Fern.EndpointSnippetTemplate> {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernEnvironment.Dev,
                "/snippet-template/get"
            ),
            method: "POST",
            headers: {
                Authorization: await this._getAuthorizationHeader(),
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "@fern-api/sdk",
                "X-Fern-SDK-Version": "0.5.0",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
            },
            contentType: "application/json",
            body: request,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return _response.body as Fern.EndpointSnippetTemplate;
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as any)?.["error"]) {
                case "UnauthorizedError":
                    throw new Fern.UnauthorizedError(_response.error.body as string);
                case "SnippetNotFound":
                    throw new Fern.SnippetNotFound(_response.error.body as string);
                default:
                    throw new errors.FernError({
                        statusCode: _response.error.statusCode,
                        body: _response.error.body,
                    });
            }
        }

        switch (_response.error.reason) {
            case "non-json":
                throw new errors.FernError({
                    statusCode: _response.error.statusCode,
                    body: _response.error.rawBody,
                });
            case "timeout":
                throw new errors.FernTimeoutError();
            case "unknown":
                throw new errors.FernError({
                    message: _response.error.errorMessage,
                });
        }
    }

    protected async _getAuthorizationHeader(): Promise<string | undefined> {
        const bearer = await core.Supplier.get(this._options.token);
        if (bearer != null) {
            return `Bearer ${bearer}`;
        }

        return undefined;
    }
}
