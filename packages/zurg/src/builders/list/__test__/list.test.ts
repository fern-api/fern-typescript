import { string } from "../../primitives";
import { list } from "../list";

describe("list", () => {
    describe("parse()", () => {
        it("functions as identity with primitives", () => {
            const schema = list(string());
            const parsed: string[] = schema.parse(["hello", "world"]);
            expect(parsed).toEqual(["hello", "world"]);
        });

        it("fails with invalid items as input", () => {
            const schema = list(string());

            // @ts-expect-error
            schema.parse([42]);
        });
    });

    describe("json()", () => {
        it("functions as identity with primitives", () => {
            const schema = list(string());
            const raw: string[] = schema.json(["hello", "world"]);
            expect(raw).toEqual(["hello", "world"]);
        });

        it("fails with invalid items as input", () => {
            const schema = list(string());

            // @ts-expect-error
            schema.json([42]);
        });
    });
});
