import {
    ExampleSingleUnionTypeProperties,
    ExampleType,
    SingleUnionTypeProperty,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
import { GeneratedUnion, GeneratedUnionType, TypeContext } from "@fern-typescript/contexts";
import { GeneratedUnionImpl } from "@fern-typescript/union-generator";
import { ts } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";
import { ParsedSingleUnionTypeForUnion } from "./ParsedSingleUnionTypeForUnion";
import { UnknownSingleUnionType } from "./UnknownSingleUnionType";
import { UnknownSingleUnionTypeGenerator } from "./UnknownSingleUnionTypeGenerator";

export class GeneratedUnionTypeImpl<Context extends TypeContext>
    extends AbstractGeneratedType<UnionTypeDeclaration, Context>
    implements GeneratedUnionType<Context>
{
    public readonly type = "union";

    private generatedUnion: GeneratedUnionImpl<Context>;
    private parsedSingleUnionTypes: ParsedSingleUnionTypeForUnion<TypeContext>[];

    constructor(superInit: AbstractGeneratedType.Init<UnionTypeDeclaration, Context>) {
        super(superInit);

        this.parsedSingleUnionTypes = this.shape.types.map(
            (singleUnionType) =>
                new ParsedSingleUnionTypeForUnion({
                    singleUnionType,
                    union: this.shape,
                })
        );

        const unknownSingleUnionTypeGenerator = new UnknownSingleUnionTypeGenerator();

        this.generatedUnion = new GeneratedUnionImpl({
            typeName: this.typeName,
            getReferenceToUnion: this.getReferenceToSelf.bind(this),
            docs: this.docs,
            discriminant: this.shape.discriminantV2.camelCase,
            parsedSingleUnionTypes: this.parsedSingleUnionTypes,
            unknownSingleUnionType: new UnknownSingleUnionType({
                singleUnionType: unknownSingleUnionTypeGenerator,
                builderParameterName: unknownSingleUnionTypeGenerator.getBuilderParameterName(),
            }),
        });
    }

    public writeToFile(context: Context): void {
        this.generatedUnion.writeToFile(context);
    }

    public getGeneratedUnion(): GeneratedUnion<Context> {
        return this.generatedUnion;
    }

    public getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string {
        return ParsedSingleUnionTypeForUnion.getSinglePropertyKey(singleProperty);
    }

    public buildExample(example: ExampleType, context: Context): ts.Expression {
        if (example.type !== "union") {
            throw new Error("Example is not for an enum");
        }

        const parsedSingleUnionType = this.parsedSingleUnionTypes.find(
            (type) => type.getWireDiscriminantValue() === example.wireDiscriminantValue
        );
        if (parsedSingleUnionType == null) {
            throw new Error("No single union type for wire discriminant value: " + example.wireDiscriminantValue);
        }
        return this.generatedUnion.build({
            discriminantValueToBuild: parsedSingleUnionType.getDiscriminantValue(),
            builderArgument: ExampleSingleUnionTypeProperties._visit<ts.Expression | undefined>(example.properties, {
                singleProperty: (property) => context.type.buildExample(property),
                samePropertiesAsObject: (exampleNamedType) =>
                    context.type
                        .getGeneratedType(exampleNamedType.typeName)
                        .buildExample(exampleNamedType.shape, context),
                noProperties: () => undefined,
                _unknown: () => {
                    throw new Error("Unknown ExampleSingleUnionTypeProperties: " + example.properties.type);
                },
            }),
            context,
        });
    }
}
