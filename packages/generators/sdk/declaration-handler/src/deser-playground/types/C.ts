import * as api from ".";

export declare type C = C.Dog | C.Cat;
export declare namespace C {
    interface Dog {
        type: "dog";
        value: string;
    }

    interface Cat extends api.A {
        type: "cat";
    }

    interface _Visitor<Result> {
        dog: (value: string) => Result;
        cat: (value: api.A) => Result;
        unknown: () => Result;
    }
}
export declare const AuthScheme: {
    // readonly dog: (value: commons.WithDocs) => AuthScheme.Bearer;
    // readonly basic: (value: commons.WithDocs) => AuthScheme.Basic;
    // readonly header: (value: services.http.HttpHeader) => AuthScheme.Header;
    // readonly _visit: <Result>(value: AuthScheme, visitor: AuthScheme._Visitor<Result>) => Result;
    // readonly _types: () => AuthScheme["_type"][];
};
