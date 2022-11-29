import { ResponseErrorV2, SingleResponseErrorProperty } from "@fern-fern/ir-model/services/commons";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { EndpointTypeSchemasContext } from "@fern-typescript/sdk-declaration-handler";
import { AbstractRawSingleUnionType } from "@fern-typescript/union-schema-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export declare namespace RawSinglePropertyErrorSingleUnionType {
    export interface Init extends AbstractRawSingleUnionType.Init {
        responseError: ResponseErrorV2;
        errorProperty: SingleResponseErrorProperty;
    }
}

export class RawSinglePropertyErrorSingleUnionType extends AbstractRawSingleUnionType<EndpointTypeSchemasContext> {
    private responseError: ResponseErrorV2;
    private errorProperty: SingleResponseErrorProperty;

    constructor({ responseError, errorProperty, ...superInit }: RawSinglePropertyErrorSingleUnionType.Init) {
        super(superInit);
        this.responseError = responseError;
        this.errorProperty = errorProperty;
    }

    protected getExtends(): ts.TypeNode[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForInterface(
        context: EndpointTypeSchemasContext
    ): OptionalKind<PropertySignatureStructure>[] {
        return [
            {
                name: `"${this.responseError.discriminantValue.wireValue}"`,
                type: getTextOfTsNode(context.getReferenceToRawError(this.errorProperty.error).getTypeNode()),
            },
        ];
    }

    protected getNonDiscriminantPropertiesForSchema(
        context: EndpointTypeSchemasContext
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        return {
            isInline: true,
            properties: [
                {
                    key: {
                        parsed: this.errorProperty.name.camelCase,
                        raw: this.errorProperty.name.wireValue,
                    },
                    value: context.getSchemaOfError(this.errorProperty.error),
                },
            ],
        };
    }
}
