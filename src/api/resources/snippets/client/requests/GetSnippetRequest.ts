/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernInternal from "../../../..";

/**
 * @example
 *     {
 *         endpoint: {
 *             method: FernInternal.EndpointMethod.Get,
 *             path: "/v1/search"
 *         }
 *     }
 */
export interface GetSnippetRequest {
    /**
     * If the same API is defined across multiple organization,
     * you must specify an organization ID.
     *
     */
    orgId?: FernInternal.OrgId;
    /**
     * If you have more than one API, you must specify its ID.
     *
     */
    apiId?: FernInternal.ApiId;
    /**
     * The SDKs for which to load snippets. If unspecified,
     * snippets for the latest published SDKs will be returned.
     *
     */
    sdks?: FernInternal.Sdk[];
    endpoint: FernInternal.EndpointIdentifier;
    /**
     * The JSON payload to be used as the input for the code snippet. This should just be thought of as the
     * request body you'd be sending to the endpoint as a cURL. If not specified then the default payload will be used.
     *
     */
    payload?: FernInternal.CustomSnippetPayload;
}
