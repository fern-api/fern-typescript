/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as environments from "../../../../environments";
import * as core from "../../../../core";
import * as FernInternal from "../../..";
import urlJoin from "url-join";
import * as errors from "../../../../errors";

export declare namespace Templates {
    interface Options {
        environment?: core.Supplier<environments.FernInternalEnvironment | string>;
        token?: core.Supplier<core.BearerToken | undefined>;
    }

    interface RequestOptions {
        timeoutInSeconds?: number;
        maxRetries?: number;
    }
}

export class Templates {
    constructor(protected readonly _options: Templates.Options = {}) {}

    /**
     * Store endpoint snippet for a particular SDK.
     */
    public async register(
        request: FernInternal.RegisterSnippetTemplateRequest,
        requestOptions?: Templates.RequestOptions
    ): Promise<void> {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernInternalEnvironment.Dev,
                "/snippet-template/register"
            ),
            method: "POST",
            headers: {
                Authorization: await this._getAuthorizationHeader(),
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "@fern/typescript-sdk",
                "X-Fern-SDK-Version": "0.0.5418",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
            },
            contentType: "application/json",
            body: request,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
        });
        if (_response.ok) {
            return;
        }

        if (_response.error.reason === "status-code") {
            throw new errors.FernInternalError({
                statusCode: _response.error.statusCode,
                body: _response.error.body,
            });
        }

        switch (_response.error.reason) {
            case "non-json":
                throw new errors.FernInternalError({
                    statusCode: _response.error.statusCode,
                    body: _response.error.rawBody,
                });
            case "timeout":
                throw new errors.FernInternalTimeoutError();
            case "unknown":
                throw new errors.FernInternalError({
                    message: _response.error.errorMessage,
                });
        }
    }

    /**
     * Store endpoint snippets for a particular SDK.
     */
    public async registerBatch(
        request: FernInternal.RegisterSnippetTemplateBatchRequest,
        requestOptions?: Templates.RequestOptions
    ): Promise<void> {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernInternalEnvironment.Dev,
                "/snippet-template/register/batch"
            ),
            method: "POST",
            headers: {
                Authorization: await this._getAuthorizationHeader(),
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "@fern/typescript-sdk",
                "X-Fern-SDK-Version": "0.0.5418",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
            },
            contentType: "application/json",
            body: request,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
        });
        if (_response.ok) {
            return;
        }

        if (_response.error.reason === "status-code") {
            throw new errors.FernInternalError({
                statusCode: _response.error.statusCode,
                body: _response.error.body,
            });
        }

        switch (_response.error.reason) {
            case "non-json":
                throw new errors.FernInternalError({
                    statusCode: _response.error.statusCode,
                    body: _response.error.rawBody,
                });
            case "timeout":
                throw new errors.FernInternalTimeoutError();
            case "unknown":
                throw new errors.FernInternalError({
                    message: _response.error.errorMessage,
                });
        }
    }

    /**
     * Get the endpoint's snippet template for a particular SDK.
     * @throws {@link FernInternal.UnauthorizedError}
     * @throws {@link FernInternal.SnippetNotFound}
     */
    public async get(
        request: FernInternal.GetSnippetTemplate,
        requestOptions?: Templates.RequestOptions
    ): Promise<FernInternal.EndpointSnippetTemplate> {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernInternalEnvironment.Dev,
                "/snippet-template/get"
            ),
            method: "POST",
            headers: {
                Authorization: await this._getAuthorizationHeader(),
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "@fern/typescript-sdk",
                "X-Fern-SDK-Version": "0.0.5418",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
            },
            contentType: "application/json",
            body: request,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
        });
        if (_response.ok) {
            return _response.body as FernInternal.EndpointSnippetTemplate;
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as any)?.["error"]) {
                case "UnauthorizedError":
                    throw new FernInternal.UnauthorizedError(_response.error.body as string);
                case "SnippetNotFound":
                    throw new FernInternal.SnippetNotFound(_response.error.body as string);
                default:
                    throw new errors.FernInternalError({
                        statusCode: _response.error.statusCode,
                        body: _response.error.body,
                    });
            }
        }

        switch (_response.error.reason) {
            case "non-json":
                throw new errors.FernInternalError({
                    statusCode: _response.error.statusCode,
                    body: _response.error.rawBody,
                });
            case "timeout":
                throw new errors.FernInternalTimeoutError();
            case "unknown":
                throw new errors.FernInternalError({
                    message: _response.error.errorMessage,
                });
        }
    }

    protected async _getAuthorizationHeader() {
        const bearer = await core.Supplier.get(this._options.token);
        if (bearer != null) {
            return `Bearer ${bearer}`;
        }

        return undefined;
    }
}
