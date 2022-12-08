import { ExampleType } from "@fern-fern/ir-model/types";
import { ts } from "ts-morph";

export interface BaseGeneratedType<Context> {
    buildExample: (example: ExampleType, context: Context) => ts.Expression;
}
