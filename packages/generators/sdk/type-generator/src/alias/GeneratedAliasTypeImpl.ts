import { AliasTypeDeclaration, ExampleType } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { GetReferenceOpts, NotBrandedGeneratedAliasType, TypeContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedAliasTypeImpl<Context extends TypeContext>
    extends AbstractGeneratedType<AliasTypeDeclaration, Context>
    implements NotBrandedGeneratedAliasType<Context>
{
    public readonly type = "alias";
    public readonly isBranded = false;

    public writeToFile(context: Context): void {
        this.writeTypeAlias(context);
    }

    public buildExample(example: ExampleType, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "alias") {
            throw new Error("Example is not for an alias");
        }
        return context.type.getGeneratedExample(example.value).build(context, opts);
    }

    private writeTypeAlias(context: Context) {
        const typeAlias = context.base.sourceFile.addTypeAlias({
            name: this.typeName,
            type: getTextOfTsNode(context.type.getReferenceToType(this.shape.aliasOf).typeNode),
            isExported: true,
        });
        maybeAddDocs(typeAlias, this.getDocs(context));
    }
}
