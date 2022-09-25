import { BaseSchema, Schema } from "../../Schema";

export interface SchemaUtils<Raw, Parsed> {
    optional: () => Schema<Raw | null | undefined, Parsed | undefined>;
    transform: <PostTransform>(transformer: BaseSchema<Parsed, PostTransform>) => Schema<Raw, PostTransform>;
}

export function getSchemaUtils<Raw, Parsed>(schema: BaseSchema<Raw, Parsed>): SchemaUtils<Raw, Parsed> {
    return {
        optional: () => optional(schema),
        transform: (transformer) => transform(schema, transformer),
    };
}

/**
 * schema utils are defined in one file to resolve issues with circular imports
 */

export function optional<Raw, Parsed>(
    schema: BaseSchema<Raw, Parsed>
): Schema<Raw | null | undefined, Parsed | undefined> {
    const baseSchema: BaseSchema<Raw | null | undefined, Parsed | undefined> = {
        parse: (raw, opts) => (raw != null ? schema.parse(raw, opts) : undefined),
        json: (parsed, opts) => (parsed != null ? schema.json(parsed, opts) : undefined),
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}

export function transform<PreTransformRaw, PreTransformParsed, PostTransform>(
    schema: BaseSchema<PreTransformRaw, PreTransformParsed>,
    transformer: BaseSchema<PreTransformParsed, PostTransform>
): Schema<PreTransformRaw, PostTransform> {
    const baseSchema: BaseSchema<PreTransformRaw, PostTransform> = {
        parse: (raw, opts) => {
            const postTransformParsed = schema.parse(raw, opts);
            return transformer.parse(postTransformParsed, opts);
        },
        json: (parsed, opts) => {
            const preTransformParsed = transformer.json(parsed, opts);
            return schema.json(preTransformParsed, opts);
        },
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}
