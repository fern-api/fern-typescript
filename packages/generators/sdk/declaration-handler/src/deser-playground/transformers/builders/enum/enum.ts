import { Schema } from "../../Schema";
import { createIdentitySchemaCreator } from "../../utils/createIdentitySchema";

export function enum_<E extends [string, ...string[]]>(_values: E): Schema<E[number], E[number]> {
    return createIdentitySchemaCreator<E[number]>()();
}
