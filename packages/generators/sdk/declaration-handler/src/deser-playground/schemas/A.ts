import { list, object, property, string } from "../transformers";
import { B } from "./B";

export const A = {
    schema: object({
        fooBar: property("foo_bar", string()),
        otherField: property("other_field", list(B.schema)),
    }),
};

A.schema.json({
    fooBar: "string",
    otherField: ["hello"],
});

A.schema.parse({
    foo_bar: "string",
    other_field: ["hello"],
});
