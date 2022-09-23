import { Schema } from "../../Schema";
import { getSchemaUtils } from "../../SchemaUtils";

export function stringLiteral<Parsed extends string>(parsed: Parsed): StringLiteralSchema<Parsed, Parsed>;
export function stringLiteral<Raw extends string, Parsed extends string>(
    parsed: Parsed,
    raw: Raw
): StringLiteralSchema<Raw, Parsed>;
export function stringLiteral<Raw extends string, Parsed extends string>(
    parsed: Parsed,
    raw: Raw = parsed as unknown as Raw
): StringLiteralSchema<Raw, Parsed> {
    const baseSchema: BaseStringLiteralSchema<Raw, Parsed> = {
        parse: () => parsed,
        json: () => raw,
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}

export type StringLiteralSchema<Raw extends string, Parsed extends string> = BaseStringLiteralSchema<Raw, Parsed> &
    Omit<Schema<Raw, Parsed>, "parse" | "json">;

interface BaseStringLiteralSchema<Raw extends string, Parsed extends string> {
    parse: () => Parsed;
    json: () => Raw;
}
