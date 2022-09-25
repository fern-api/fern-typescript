import { ts } from "ts-morph";

export interface Zurg {
    object: (properties: Zurg.Property[]) => Zurg.ObjectSchema;
    union: (args: Zurg.union.Args) => Zurg.ObjectLikeSchema;
    list: (itemSchema: Zurg.Schema) => Zurg.Schema;
    enum: (values: string[]) => Zurg.Schema;
    string: () => Zurg.Schema;
    stringLiteral: (parsedValue: string) => Zurg.Schema;
    number: () => Zurg.Schema;
    boolean: () => Zurg.Schema;
}

export declare namespace Zurg {
    interface Schema {
        toExpression: () => ts.Expression;
    }

    interface ObjectLikeSchema extends Schema {
        withProperties: (properties: Zurg.AdditionalProperty[]) => Zurg.ObjectLikeSchema;
    }

    interface AdditionalProperty {
        key: string;
        getValue: (args: { getReferenceToParsed: () => ts.Expression }) => ts.Expression;
    }

    interface ObjectSchema extends ObjectLikeSchema {
        extend: (extension: Zurg.Schema) => ObjectSchema;
    }

    interface Property {
        key: {
            parsed: string;
            raw: string;
        };
        value: Schema;
    }

    namespace union {
        interface Args {
            parsedDiscriminant: string;
            rawDiscriminant: string;
            singleUnionType: Zurg.union.SingleUnionType[];
        }

        interface SingleUnionType {
            discriminantValue: string;
            properties: Zurg.Property[];
        }
    }
}
