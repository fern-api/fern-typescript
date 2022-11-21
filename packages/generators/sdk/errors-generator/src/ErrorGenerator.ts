import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { GeneratedError } from "@fern-typescript/sdk-declaration-handler";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { GeneratedErrorImpl } from "./GeneratedErrorImpl";
import { NoopGeneratedError } from "./NoopGeneratedError";

export declare namespace ErrorGenerator {
    export interface Init {
        useBrandedStringAliases: boolean;
    }

    export namespace generateError {
        export interface Args {
            errorName: string;
            errorDeclaration: ErrorDeclaration;
        }
    }
}

export class ErrorGenerator {
    private typeGenerator: TypeGenerator;

    constructor({ useBrandedStringAliases }: ErrorGenerator.Init) {
        this.typeGenerator = new TypeGenerator({ useBrandedStringAliases });
    }

    public generateError({ errorDeclaration, errorName }: ErrorGenerator.generateError.Args): GeneratedError {
        if (errorDeclaration.type._type === "alias" && errorDeclaration.type.aliasOf._type === "void") {
            return new NoopGeneratedError();
        }
        return new GeneratedErrorImpl({
            errorDeclaration,
            errorName,
            typeGenerator: this.typeGenerator,
        });
    }
}
