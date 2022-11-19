import { TypeDeclaration } from "@fern-fern/ir-model/types";
import { GeneratedTypeSchema, TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";

export declare namespace AbstractGeneratedTypeSchema {
    export interface Init<Shape> {
        typeName: string;
        typeDeclaration: TypeDeclaration;
        shape: Shape;
    }
}

export abstract class AbstractGeneratedTypeSchema<Shape> implements GeneratedTypeSchema {
    protected typeName: string;
    protected typeDeclaration: TypeDeclaration;
    protected shape: Shape;

    constructor({ typeName, typeDeclaration, shape }: AbstractGeneratedTypeSchema.Init<Shape>) {
        this.typeName = typeName;
        this.typeDeclaration = typeDeclaration;
        this.shape = shape;
    }

    public abstract writeToFile(context: TypeSchemaContext): void;
}
