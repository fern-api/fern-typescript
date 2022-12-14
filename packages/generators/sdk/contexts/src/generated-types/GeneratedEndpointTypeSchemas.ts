import { ts } from "ts-morph";
import { EndpointTypeSchemasContext } from "../contexts";
import { GeneratedFile } from "./GeneratedFile";

export interface GeneratedEndpointTypeSchemas extends GeneratedFile<EndpointTypeSchemasContext> {
    getReferenceToRawResponse: (context: EndpointTypeSchemasContext) => ts.TypeNode;
    getReferenceToRawError: (context: EndpointTypeSchemasContext) => ts.TypeNode;
    serializeRequest: (referenceToParsedRequest: ts.Expression, context: EndpointTypeSchemasContext) => ts.Expression;
    deserializeResponse: (referenceToRawResponse: ts.Expression, context: EndpointTypeSchemasContext) => ts.Expression;
    deserializeError: (referenceToRawError: ts.Expression, context: EndpointTypeSchemasContext) => ts.Expression;
}
