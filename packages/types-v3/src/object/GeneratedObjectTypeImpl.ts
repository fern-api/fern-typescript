import { ObjectTypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";
import { GeneratedObjectType } from "./GeneratedObjectType";

export class GeneratedObjectTypeImpl
    extends AbstractGeneratedType<ObjectTypeDeclaration>
    implements GeneratedObjectType
{
    public writeToFile(file: SdkFile): void {
        const interfaceNode = file.sourceFile.addInterface({
            name: this.typeName,
            properties: [
                ...this.shape.properties.map((property) => {
                    const value = file.getReferenceToType(property.valueType);
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
            interfaceNode.addExtends(getTextOfTsNode(file.getReferenceToNamedType(extension).getTypeNode()));
        }
    }
}
