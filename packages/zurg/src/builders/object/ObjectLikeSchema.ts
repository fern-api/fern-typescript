import { BaseSchema, Schema } from "../../Schema";
import { getSchemaUtils } from "../../SchemaUtils";

export type ObjectLikeSchema<Raw, Parsed> = Schema<Raw, Parsed> &
    BaseObjectLikeSchema<Raw, Parsed> &
    ObjectLikeUtils<Raw, Parsed>;

export type BaseObjectLikeSchema<Raw, Parsed> = BaseSchema<Raw, Parsed> & {
    _objectLike: void;
};

export interface ObjectLikeUtils<Raw, Parsed> {
    withProperties: <T extends Record<string, any>>(properties: {
        [K in keyof T]: T[K] | ((parsed: Parsed) => T[K]);
    }) => ObjectLikeSchema<Raw, Parsed & T>;
}

export function getObjectLikeProperties<Raw, Parsed>(
    schema: BaseObjectLikeSchema<Raw, Parsed>
): ObjectLikeUtils<Raw, Parsed> {
    return {
        withProperties: (properties) => withProperties(schema, properties),
    };
}

export const OBJECT_LIKE_BRAND = undefined as unknown as { _objectLike: void };

function withProperties<RawObjectShape, ParsedObjectShape, Properties>(
    objectLike: BaseObjectLikeSchema<RawObjectShape, ParsedObjectShape>,
    properties: { [K in keyof Properties]: Properties[K] | ((parsed: ParsedObjectShape) => Properties[K]) }
): ObjectLikeSchema<RawObjectShape, ParsedObjectShape & Properties> {
    const objectSchema: BaseObjectLikeSchema<RawObjectShape, ParsedObjectShape & Properties> = {
        ...OBJECT_LIKE_BRAND,
        parse: (raw, opts) => {
            const parsedObject = objectLike.parse(raw, opts);
            const additionalProperties = Object.entries(properties).reduce<Record<string, any>>(
                (processed, [key, value]) => {
                    return {
                        ...processed,
                        [key]: typeof value === "function" ? value(parsedObject) : value,
                    };
                },
                {}
            );

            return {
                ...parsedObject,
                ...(additionalProperties as Properties),
            };
        },
        json: (parsed, opts) => {
            // strip out added properties
            const addedPropertyKeys = new Set(Object.keys(properties));
            const parsedWithoutAddedProperties = Object.entries(parsed).reduce<Record<string, any>>(
                (filtered, [key, value]) => {
                    if (!addedPropertyKeys.has(key)) {
                        filtered[key] = value;
                    }
                    return filtered;
                },
                {}
            );

            return objectLike.json(parsedWithoutAddedProperties as ParsedObjectShape, opts);
        },
    };

    return {
        ...objectSchema,
        ...getSchemaUtils(objectSchema),
        ...getObjectLikeProperties(objectSchema),
    };
}
