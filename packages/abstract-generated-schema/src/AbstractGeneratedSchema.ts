import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";
import { ts, VariableDeclarationKind } from "ts-morph";

export declare namespace AbstractGeneratedSchema {
    export interface Init {
        typeName: string;
    }
}

export abstract class AbstractGeneratedSchema<Context extends TypeSchemaContext = TypeSchemaContext> {
    public static RAW_TYPE_NAME = "Raw";

    protected typeName: string;

    constructor({ typeName }: AbstractGeneratedSchema.Init) {
        this.typeName = typeName;
    }

    public writeSchemaToFile(context: Context): void {
        context.sourceFile.addVariableStatement({
            isExported: true,
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
                {
                    name: this.typeName,
                    type: getTextOfTsNode(this.getReferenceToSchemaType(context)),
                    initializer: getTextOfTsNode(this.getSchema(context).toExpression()),
                },
            ],
        });

        this.generateModule(context);
    }

    public static getReferenceToRawSchema({
        referenceToSchemaModule,
    }: {
        referenceToSchemaModule: ts.EntityName;
    }): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(referenceToSchemaModule, AbstractGeneratedSchema.RAW_TYPE_NAME)
        );
    }

    private getReferenceToSchemaType(context: Context): ts.TypeNode {
        return context.coreUtilities.zurg.Schema._getReferenceToType({
            rawShape: this.getReferenceToRawShape(context),
            parsedShape: this.getReferenceToParsedShape(context),
        });
    }

    protected abstract getReferenceToRawShape(context: Context): ts.TypeNode;
    protected abstract getReferenceToParsedShape(context: Context): ts.TypeNode;
    protected abstract generateModule(context: Context): void;
    protected abstract getSchema(context: Context): Zurg.Schema;
}
