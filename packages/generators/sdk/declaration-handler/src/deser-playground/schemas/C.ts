import { object } from "../transformers";
import { stringLiteral } from "../transformers/builders/literal/literal";
import { union } from "../transformers/builders/union/union";
import * as api from "../types";
import { A } from "./A";
import { B } from "./B";

export const C = {
    schema: union(stringLiteral("type", "_type"), {
        dog: object({ value: B.schema }),
        cat: A.schema,
    }).withProperties((parsed) => {
        return {
            _visit: <Result>(visitor: api.C._Visitor<Result>) => {
                switch (parsed.type) {
                    case "dog":
                        return visitor.dog(parsed.value);
                    case "cat":
                        return visitor.cat(parsed);
                    default:
                        return visitor.unknown();
                }
            },
        };
    }),
};
