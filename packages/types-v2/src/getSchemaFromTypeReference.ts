import { assertNever } from "@fern-api/core-utils";
import { ContainerType, TypeReference } from "@fern-fern/ir-model/types";
import { getSyntaxKindForPrimitive } from "@fern-typescript/commons-v2";
import { SdkFile, Zurg } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";

export function getSchemaFromTypeReference(typeReference: TypeReference, file: SdkFile): Zurg.Schema {
    return TypeReference._visit(typeReference, {
        primitive: (primitive) => {
            const syntaxKind = getSyntaxKindForPrimitive(primitive);
            switch (syntaxKind) {
                case ts.SyntaxKind.StringKeyword:
                    return file.coreUtilities.zurg.string();
                case ts.SyntaxKind.NumberKeyword:
                    return file.coreUtilities.zurg.number();
                case ts.SyntaxKind.BooleanKeyword:
                    return file.coreUtilities.zurg.boolean();
                default:
                    assertNever(syntaxKind);
            }
        },
        container: (container) =>
            ContainerType._visit(container, {
                list: (itemType) => file.coreUtilities.zurg.list(getSchemaFromTypeReference(itemType, file)),
                set: (itemType) => file.coreUtilities.zurg.list(getSchemaFromTypeReference(itemType, file)),
                map: ({ keyType, valueType }) => {
                    const resolvedKeyType = file.resolveTypeReference(keyType);
                    const keySchema =
                        resolvedKeyType._type === "primitive"
                            ? getSchemaFromTypeReference(keyType, file)
                            : file.coreUtilities.zurg.string();
                    return file.coreUtilities.zurg.record({
                        keySchema,
                        valueSchema: getSchemaFromTypeReference(valueType, file),
                    });
                },
                optional: (itemType) => getSchemaFromTypeReference(itemType, file).optional(),
                _unknown: () => {
                    throw new Error("Unknown container type: " + container._type);
                },
            }),
        named: (typeName) => file.getReferenceToTypeSchema(typeName),
        unknown: () => file.coreUtilities.zurg.unknown(),
        void: () => {
            throw new Error("Cannot reference void when generating schema");
        },
        _unknown: () => {
            throw new Error("Unknown type reference type: " + typeReference._type);
        },
    });
}
