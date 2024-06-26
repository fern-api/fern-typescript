/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as Fern from "../../../index";

export type Snippet =
    | Fern.Snippet.Typescript
    | Fern.Snippet.Python
    | Fern.Snippet.Java
    | Fern.Snippet.Go
    | Fern.Snippet.Ruby;

export declare namespace Snippet {
    interface Typescript extends Fern.TypeScriptSnippet, _Base {
        type: "typescript";
    }

    interface Python extends Fern.PythonSnippet, _Base {
        type: "python";
    }

    interface Java extends Fern.JavaSnippet, _Base {
        type: "java";
    }

    interface Go extends Fern.GoSnippet, _Base {
        type: "go";
    }

    interface Ruby extends Fern.RubySnippet, _Base {
        type: "ruby";
    }

    interface _Base {
        exampleIdentifier?: string;
    }
}
