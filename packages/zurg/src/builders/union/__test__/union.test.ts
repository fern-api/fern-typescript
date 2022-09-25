import { itSchema, itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { object } from "../../object";
import { boolean, number, string } from "../../primitives";
import { discriminant } from "../discriminant";
import { union } from "../union";

describe("union", () => {
    itSchemaIdentity(
        union("type", {
            lion: {
                meows: boolean(),
            },
            giraffe: object({
                heightInInches: number(),
            }).properties,
        }),
        { type: "lion", meows: true },
        { title: "doesn't transform discriminant when it's a string" }
    );

    itSchema(
        "transforms discriminant when it's a discriminant()",
        union(discriminant("type", "_type"), {
            lion: { meows: boolean() },
            giraffe: { heightInInches: number() },
        }),
        {
            raw: { _type: "lion", meows: true },
            parsed: { type: "lion", meows: true },
        }
    );

    itSchema(
        "transforms discriminant when discriminant value is unrecognized",
        union(discriminant("type", "_type"), {
            lion: { meows: boolean() },
            giraffe: { heightInInches: number() },
        }),
        {
            // @ts-expect-error
            raw: { _type: "moose" },
            // @ts-expect-error
            parsed: { type: "moose" },
        }
    );

    describe("withProperties", () => {
        it("Added property is included on parsed object", () => {
            const schema = union("type", {
                lion: {},
                tiger: { value: string() },
            }).withProperties({
                printType: (parsed) => () => parsed.type,
            });

            const parsed = schema.parse({ type: "lion" });
            expect(parsed.printType()).toBe("lion");
        });
    });

    describe("compile", () => {
        // eslint-disable-next-line jest/expect-expect
        it("doesn't compile when discriminant is subtype is not an object", () => {
            () =>
                union("type", {
                    // @ts-expect-error
                    lion: [],
                });
        });

        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile when input is missing discriminant", () => {
                const schema = union("type", {
                    lion: {},
                    tiger: { value: string() },
                });

                // @ts-expect-error
                () => schema.parse({});
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-object as input", () => {
                const schema = union("type", {
                    lion: {},
                    tiger: { value: string() },
                });

                // @ts-expect-error
                () => schema.parse([]);
            });
        });

        describe("json()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile when input is missing discriminant", () => {
                const schema = union("type", {
                    lion: {},
                    tiger: { value: string() },
                });

                // @ts-expect-error
                () => schema.json({});
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-object as input", () => {
                const schema = union("type", {
                    lion: {},
                    tiger: { value: string() },
                });

                // @ts-expect-error
                () => schema.json([]);
            });
        });
    });
});
