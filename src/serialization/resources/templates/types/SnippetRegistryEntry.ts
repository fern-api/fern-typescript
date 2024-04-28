/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../..";
import * as Fern from "../../../../api";
import * as core from "../../../../core";
import { Sdk } from "../../snippets/types/Sdk";
import { EndpointIdentifier } from "../../snippets/types/EndpointIdentifier";
import { VersionedSnippetTemplate } from "./VersionedSnippetTemplate";

export const SnippetRegistryEntry: core.serialization.ObjectSchema<
    serializers.SnippetRegistryEntry.Raw,
    Fern.SnippetRegistryEntry
> = core.serialization.object({
    sdk: Sdk,
    endpointId: EndpointIdentifier,
    snippetTemplate: VersionedSnippetTemplate,
});

export declare namespace SnippetRegistryEntry {
    interface Raw {
        sdk: Sdk.Raw;
        endpointId: EndpointIdentifier.Raw;
        snippetTemplate: VersionedSnippetTemplate.Raw;
    }
}