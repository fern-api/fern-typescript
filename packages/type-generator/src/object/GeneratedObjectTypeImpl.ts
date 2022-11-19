import { ObjectTypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";
import { GeneratedObjectType } from "./GeneratedObjectType";

export class GeneratedObjectTypeImpl
    extends AbstractGeneratedType<ObjectTypeDeclaration>
    implements GeneratedObjectType
{
    public writeToFile(context: TypeContext): void {
        const interfaceNode = context.sourceFile.addInterface({
            name: this.typeName,
            properties: [
                ...this.shape.properties.map((property) => {
                    const value = context.getReferenceToType(property.valueType);
                    const propertyNode: OptionalKind<PropertySignatureStructure> = {
                        name: property.nameV2.name.unsafeName.camelCase,
                        type: getTextOfTsNode(value.typeNode),
                        hasQuestionToken: value.isOptional,
                        docs: property.docs != null ? [{ description: property.docs }] : undefined,
                    };

                    return propertyNode;
                }),
            ],
            isExported: true,
        });

        maybeAddDocs(interfaceNode, this.typeDeclaration.docs);

        for (const extension of this.shape.extends) {
            interfaceNode.addExtends(getTextOfTsNode(context.getReferenceToNamedType(extension).getTypeNode()));
        }
    }
}
