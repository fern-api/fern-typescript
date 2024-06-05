/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as environments from "../../../../environments";
import * as core from "../../../../core";
import * as Fern from "../../../index";
import urlJoin from "url-join";
import * as errors from "../../../../errors/index";

export declare namespace Snippets {
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

export class Snippets {
    constructor(protected readonly _options: Snippets.Options = {}) {}

    /**
     * Get snippet by endpoint method and path
     *
     * @param {Fern.GetSnippetRequest} request
     * @param {Snippets.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link Fern.UnauthorizedError}
     * @throws {@link Fern.UserNotInOrgError}
     * @throws {@link Fern.UnavailableError}
     * @throws {@link Fern.ApiIdRequiredError}
     * @throws {@link Fern.OrgIdRequiredError}
     * @throws {@link Fern.OrgIdAndApiIdNotFound}
     * @throws {@link Fern.OrgIdNotFound}
     * @throws {@link Fern.EndpointNotFound}
     * @throws {@link Fern.SdkNotFound}
     *
     * @example
     *     await fern.snippets.get({
     *         endpoint: {
     *             method: Fern.EndpointMethod.Get,
     *             path: "/v1/search"
     *         }
     *     })
     */
    public async get(
        request: Fern.GetSnippetRequest,
        requestOptions?: Snippets.RequestOptions
    ): Promise<Fern.Snippet[]> {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernEnvironment.Dev,
                "/snippets"
            ),
            method: "POST",
            headers: {
                Authorization: await this._getAuthorizationHeader(),
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "@fern-api/sdk",
                "X-Fern-SDK-Version": "v0.4.0",
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
            return _response.body as Fern.Snippet[];
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as any)?.["error"]) {
                case "UnauthorizedError":
                    throw new Fern.UnauthorizedError(_response.error.body as string);
                case "UserNotInOrgError":
                    throw new Fern.UserNotInOrgError();
                case "UnavailableError":
                    throw new Fern.UnavailableError(_response.error.body as string);
                case "ApiIdRequiredError":
                    throw new Fern.ApiIdRequiredError(_response.error.body as string);
                case "OrgIdRequiredError":
                    throw new Fern.OrgIdRequiredError(_response.error.body as string);
                case "OrgIdAndApiIdNotFound":
                    throw new Fern.OrgIdAndApiIdNotFound(_response.error.body as string);
                case "OrgIdNotFound":
                    throw new Fern.OrgIdNotFound(_response.error.body as string);
                case "EndpointNotFound":
                    throw new Fern.EndpointNotFound(_response.error.body as string);
                case "SDKNotFound":
                    throw new Fern.SdkNotFound(_response.error.body as string);
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

    /**
     * @param {Fern.ListSnippetsRequest} request
     * @param {Snippets.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link Fern.UnauthorizedError}
     * @throws {@link Fern.UserNotInOrgError}
     * @throws {@link Fern.UnavailableError}
     * @throws {@link Fern.InvalidPageError}
     * @throws {@link Fern.ApiIdRequiredError}
     * @throws {@link Fern.OrgIdRequiredError}
     * @throws {@link Fern.OrgIdAndApiIdNotFound}
     * @throws {@link Fern.OrgIdNotFound}
     * @throws {@link Fern.SdkNotFound}
     *
     * @example
     *     await fern.snippets.load({
     *         page: 1,
     *         orgId: "vellum",
     *         apiId: "vellum-ai",
     *         sdks: [{
     *                 type: "python",
     *                 package: "vellum-ai"
     *             }]
     *     })
     */
    public async load(
        request: Fern.ListSnippetsRequest = {},
        requestOptions?: Snippets.RequestOptions
    ): Promise<Fern.SnippetsPage> {
        const { page, ..._body } = request;
        const _queryParams: Record<string, string | string[] | object | object[]> = {};
        if (page != null) {
            _queryParams["page"] = page.toString();
        }

        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernEnvironment.Dev,
                "/snippets/load"
            ),
            method: "POST",
            headers: {
                Authorization: await this._getAuthorizationHeader(),
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "@fern-api/sdk",
                "X-Fern-SDK-Version": "v0.4.0",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
            },
            contentType: "application/json",
            queryParameters: _queryParams,
            body: _body,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return _response.body as Fern.SnippetsPage;
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as any)?.["error"]) {
                case "UnauthorizedError":
                    throw new Fern.UnauthorizedError(_response.error.body as string);
                case "UserNotInOrgError":
                    throw new Fern.UserNotInOrgError();
                case "UnavailableError":
                    throw new Fern.UnavailableError(_response.error.body as string);
                case "InvalidPageError":
                    throw new Fern.InvalidPageError(_response.error.body as string);
                case "ApiIdRequiredError":
                    throw new Fern.ApiIdRequiredError(_response.error.body as string);
                case "OrgIdRequiredError":
                    throw new Fern.OrgIdRequiredError(_response.error.body as string);
                case "OrgIdAndApiIdNotFound":
                    throw new Fern.OrgIdAndApiIdNotFound(_response.error.body as string);
                case "OrgIdNotFound":
                    throw new Fern.OrgIdNotFound(_response.error.body as string);
                case "SDKNotFound":
                    throw new Fern.SdkNotFound(_response.error.body as string);
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
