import { GeneratedEndpointTypes } from "../generated-types";
import { Reference } from "../Reference";
import { BaseContext } from "./BaseContext";
import {
    ErrorReferencingContextMixin,
    ErrorSchemaReferencingContextMixin,
    TypeReferencingContextMixin,
} from "./mixins";

export interface EndpointTypeSchemasContext
    extends BaseContext,
        TypeReferencingContextMixin,
        ErrorReferencingContextMixin,
        ErrorSchemaReferencingContextMixin {
    getEndpointTypesBeingGenerated: () => GeneratedEndpointTypes;
    getReferenceToEndpointTypeExport: (export_: string | string[]) => Reference;
}
