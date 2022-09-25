import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { stringLiteral } from "../../literals";
import { string } from "../../primitives";
import { object } from "../object";

describe("extend", () => {
    itSchemaIdentity(
        object({
            foo: string(),
        }).extend({
            bar: stringLiteral("bar"),
        }),
        {
            foo: "",
            bar: "bar",
        } as const,
        {
            title: "extended properties are included in schema",
        }
    );

    describe("compile", () => {
        // eslint-disable-next-line jest/expect-expect
        it("doesn't compile with non-object schema", () => {
            () =>
                object({
                    foo: string(),
                })
                    // @ts-expect-error
                    .extend([]);
        });
    });
});
