import { TypeDeclaration } from "@fern-fern/ir-model/types";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-generated-schema";
import { GeneratedTypeSchema, TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";

export declare namespace AbstractGeneratedTypeSchema {
    export interface Init<Shape> {
        typeName: string;
        typeDeclaration: TypeDeclaration;
        shape: Shape;
    }
}

export abstract class AbstractGeneratedTypeSchema<Shape>
    extends AbstractGeneratedSchema
    implements GeneratedTypeSchema
{
    protected typeDeclaration: TypeDeclaration;
    protected shape: Shape;

    constructor({ typeName, typeDeclaration, shape }: AbstractGeneratedTypeSchema.Init<Shape>) {
        super({ typeName });
        this.typeDeclaration = typeDeclaration;
        this.shape = shape;
    }

    public writeToFile(context: TypeSchemaContext): void {
        this.writeSchemaToFile(context);
    }

    protected override getReferenceToParsedShape(context: TypeSchemaContext): ts.TypeNode {
        return context.getReferenceToNamedType(this.typeDeclaration.name).getTypeNode();
    }

    protected override generateModule(context: TypeSchemaContext): void {
        const module = context.sourceFile.addModule({
            name: this.getModuleName(),
            isExported: true,
            hasDeclareKeyword: true,
        });
        this.generateRawTypeDeclaration(context, module);
    }

    private getModuleName() {
        return this.typeName;
    }

    protected getReferenceToRawShape(): ts.TypeNode {
        return AbstractGeneratedTypeSchema.getReferenceToRawSchema({
            referenceToSchemaModule: ts.factory.createIdentifier(this.getModuleName()),
        });
    }

    protected abstract generateRawTypeDeclaration(context: TypeSchemaContext, module: ModuleDeclaration): void;
}
