/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernInternal from "../../../..";

export interface RegisterSnippetTemplateBatchRequest {
    /**
     * The organization to create snippets for.
     *
     */
    orgId: FernInternal.OrgId;
    /**
     * The API name.
     *
     */
    apiId: FernInternal.ApiId;
    apiDefinitionId: FernInternal.ApiDefinitionId;
    snippets: FernInternal.SnippetRegistryEntry[];
}