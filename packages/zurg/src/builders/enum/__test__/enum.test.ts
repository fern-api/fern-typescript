import { enum_ } from "../enum";

describe("enum", () => {
    describe("parse()", () => {
        it("functions as identity", () => {
            const schema = enum_(["A", "B", "C"]);
            const parsed: "A" | "B" | "C" = schema.parse("A");
            expect(parsed).toBe("A");
        });

        it("fails with invalid enum as input", () => {
            const schema = enum_(["A", "B", "C"]);

            // @ts-expect-error
            schema.parse("D");
        });
    });

    describe("json()", () => {
        it("function as identity", () => {
            const schema = enum_(["A", "B", "C"]);
            const raw: "A" | "B" | "C" = schema.json("A");
            expect(raw).toBe("A");
        });

        it("fails with invalid enum as input", () => {
            const schema = enum_(["A", "B", "C"]);

            // @ts-expect-error
            schema.json("D");
        });
    });
});
