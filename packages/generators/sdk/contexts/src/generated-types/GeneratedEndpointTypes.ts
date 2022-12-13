import { InlinedRequestBodyProperty } from "@fern-fern/ir-model/services/http";
import { ts } from "ts-morph";
import { EndpointTypesContext } from "../contexts";
import { GeneratedFile } from "./GeneratedFile";
import { GeneratedUnion } from "./GeneratedUnion";

export interface GeneratedEndpointTypes extends GeneratedFile<EndpointTypesContext> {
    getErrorUnion: () => GeneratedUnion<EndpointTypesContext>;
    getReferenceToRequestBodyType: (context: EndpointTypesContext) => ts.TypeNode;
    getReferenceToResponseType: (context: EndpointTypesContext) => ts.TypeNode;
    getInlinedRequestBodyPropertyKey: (property: InlinedRequestBodyProperty) => string;
}
