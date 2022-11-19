import { MapType, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { ts } from "ts-morph";
import { AbstractTypeReferenceToTypeNodeConverter } from "./AbstractTypeReferenceToTypeNodeConverter";

export class TypeReferenceToParsedTypeNodeConverter extends AbstractTypeReferenceToTypeNodeConverter {
    protected override map(map: MapType): TypeReferenceNode {
        return {
            typeNode: ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                this.convert(map.keyType).typeNode,
                this.convert(map.valueType).typeNode,
            ]),
            isOptional: false,
        };
    }

    protected override set(itemType: TypeReference): TypeReferenceNode {
        const itemTypeNode = this.convert(itemType).typeNode;

        return {
            typeNode: this.isTypeReferencePrimitive(itemType)
                ? ts.factory.createTypeReferenceNode("Set", [itemTypeNode])
                : ts.factory.createArrayTypeNode(itemTypeNode),
            isOptional: false,
        };
    }

    protected override dateTime(): TypeReferenceNode {
        return {
            typeNode: ts.factory.createTypeReferenceNode("Date"),
            isOptional: false,
        };
    }
}
