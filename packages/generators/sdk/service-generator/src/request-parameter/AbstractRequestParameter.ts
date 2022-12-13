import { HttpEndpoint, HttpHeader, HttpService, QueryParameter } from "@fern-fern/ir-model/services/http";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ServiceContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { RequestParameter } from "./RequestParameter";

export declare namespace AbstractRequestParameter {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
    }
}

export abstract class AbstractRequestParameter implements RequestParameter {
    // TODO this should be in IR, since this can conflict with path parameter names
    protected static REQUEST_PARAMETER_NAME = "request";

    protected service: HttpService;
    protected endpoint: HttpEndpoint;

    constructor({ service, endpoint }: AbstractRequestParameter.Init) {
        this.service = service;
        this.endpoint = endpoint;
    }

    public getParameterDeclaration(context: ServiceContext): OptionalKind<ParameterDeclarationStructure> {
        const type = this.getParameterType(context);

        return {
            name: AbstractRequestParameter.REQUEST_PARAMETER_NAME,
            type: getTextOfTsNode(type.type),
            hasQuestionToken: type.isOptional,
        };
    }

    public abstract getReferenceToRequestBody(context: ServiceContext): ts.Expression;
    public abstract getReferenceToQueryParameter(
        queryParameter: QueryParameter,
        context: ServiceContext
    ): ts.Expression;
    public abstract getReferenceToHeader(header: HttpHeader, context: ServiceContext): ts.Expression;
    protected abstract getParameterType(contxt: ServiceContext): { type: ts.TypeNode; isOptional: boolean };
}
