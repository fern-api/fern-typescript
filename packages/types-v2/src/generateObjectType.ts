import { ObjectTypeDeclaration, TypeReference } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { SdkFile, Zurg } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts, VariableDeclarationKind } from "ts-morph";
import { getSchemaFromTypeReference } from "./getSchemaFromTypeReference";

interface PropertyWithSchema {
    docs: string | undefined;
    key: {
        raw: string;
        parsed: string;
    };
    getValueType: (file: SdkFile) => {
        type: ts.TypeNode;
        isOptional: boolean;
    };
    getSchema: (file: SdkFile) => Zurg.Schema;
}

export declare namespace generateObjectType {
    interface Args {
        typeFile: SdkFile;
        schemaFile: SdkFile;
        docs: string | null | undefined;
        typeName: string;
        shape: ObjectTypeDeclaration;
        additionalProperties?: generateObjectType.AdditionalProperty[];
    }

    interface AdditionalProperty {
        docs: string | undefined;
        key: {
            raw: string;
            parsed: string;
        };
        value: { type: "type"; reference: TypeReference } | { type: "literal"; literal: string; isOptional: boolean };
    }
}

export function generateObjectType({
    typeName,
    docs,
    typeFile,
    schemaFile,
    shape,
    additionalProperties = [],
}: generateObjectType.Args): void {
    const properties: PropertyWithSchema[] = [
        ...additionalProperties.map((additionalProperty) => ({
            docs: additionalProperty.docs,
            key: {
                raw: additionalProperty.key.raw,
                parsed: additionalProperty.key.parsed,
            },
            ...getValueGettersFromAdditionalProperty(additionalProperty),
        })),
        ...shape.properties.map((property): PropertyWithSchema => {
            return {
                docs: property.docs ?? undefined,
                key: {
                    raw: property.name.wireValue,
                    parsed: property.name.camelCase,
                },
                getValueType: (file) => {
                    const referenceToProperty = file.getReferenceToType(property.valueType);
                    return {
                        type: referenceToProperty.isOptional
                            ? referenceToProperty.typeNodeWithoutUndefined
                            : referenceToProperty.typeNode,
                        isOptional: referenceToProperty.isOptional,
                    };
                },
                getSchema: (file) => getSchemaFromTypeReference(property.valueType, file),
            };
        }),
    ];

    const interfaceNode = typeFile.sourceFile.addInterface({
        name: typeName,
        properties: [
            ...properties.map((property) => {
                const value = property.getValueType(typeFile);
                const propertyNode: OptionalKind<PropertySignatureStructure> = {
                    name: property.key.parsed,
                    type: getTextOfTsNode(value.type),
                    hasQuestionToken: value.isOptional,
                    docs: property.docs != null ? [{ description: property.docs }] : undefined,
                };

                return propertyNode;
            }),
        ],
        isExported: true,
    });

    maybeAddDocs(interfaceNode, docs);

    let schema = schemaFile.coreUtilities.zurg.object(
        properties.map((property) => ({
            key: {
                raw: property.key.raw,
                parsed: property.key.parsed,
            },
            value: property.getSchema(schemaFile),
        }))
    );

    for (const extension of shape.extends) {
        interfaceNode.addExtends(getTextOfTsNode(typeFile.getReferenceToNamedType(extension).typeNode));
        schema = schema.extend(getSchemaFromTypeReference(TypeReference.named(extension), schemaFile));
    }

    schemaFile.sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [{ name: typeName, initializer: getTextOfTsNode(schema.toExpression()) }],
    });
}

function getValueGettersFromAdditionalProperty(
    additionalProperty: generateObjectType.AdditionalProperty
): Pick<PropertyWithSchema, "getValueType" | "getSchema"> {
    switch (additionalProperty.value.type) {
        case "literal": {
            const { isOptional, literal } = additionalProperty.value;
            return {
                getValueType: () => {
                    return {
                        isOptional,
                        type: ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(literal)),
                    };
                },
                getSchema: (file) => {
                    let schema = file.coreUtilities.zurg.stringLiteral(literal);
                    if (isOptional) {
                        schema = schema.optional();
                    }
                    return schema;
                },
            };
        }
        case "type": {
            const { reference } = additionalProperty.value;
            return {
                getValueType: (file) => {
                    const referenceToProperty = file.getReferenceToType(reference);
                    return {
                        isOptional: referenceToProperty.isOptional,
                        type: referenceToProperty.isOptional
                            ? referenceToProperty.typeNodeWithoutUndefined
                            : referenceToProperty.typeNode,
                    };
                },
                getSchema: (file) => getSchemaFromTypeReference(reference, file),
            };
        }
    }
}
