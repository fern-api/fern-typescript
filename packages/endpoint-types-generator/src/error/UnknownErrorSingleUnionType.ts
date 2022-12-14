import { EndpointTypesContext } from "@fern-typescript/contexts";
import { AbstractUnknownSingleUnionType } from "@fern-typescript/union-generator";

export class UnknownErrorSingleUnionType extends AbstractUnknownSingleUnionType<EndpointTypesContext> {
    public getDocs(): string | null | undefined {
        return undefined;
    }
}
