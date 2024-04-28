/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as Fern from "../../..";

export type Template =
    | Fern.Template.Generic
    | Fern.Template.Enum
    | Fern.Template.DiscriminatedUnion
    | Fern.Template.Union
    | Fern.Template.Dict
    | Fern.Template.Iterable;

export declare namespace Template {
    interface Generic extends Fern.GenericTemplate {
        type: "generic";
    }

    interface Enum extends Fern.EnumTemplate {
        type: "enum";
    }

    interface DiscriminatedUnion extends Fern.DiscriminatedUnionTemplate {
        type: "discriminatedUnion";
    }

    interface Union extends Fern.UnionTemplate {
        type: "union";
    }

    interface Dict extends Fern.DictTemplate {
        type: "dict";
    }

    interface Iterable extends Fern.IterableTemplate {
        type: "iterable";
    }
}