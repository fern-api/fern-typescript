/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as Fern from "../../../index";

export type SdkRequest =
    | Fern.SdkRequest.Typescript
    | Fern.SdkRequest.Python
    | Fern.SdkRequest.Go
    | Fern.SdkRequest.Ruby
    | Fern.SdkRequest.Java;

export declare namespace SdkRequest {
    interface Typescript extends Fern.TypeScriptSdkRequest {
        type: "typescript";
    }

    interface Python extends Fern.PythonSdkRequest {
        type: "python";
    }

    interface Go extends Fern.GoSdkRequest {
        type: "go";
    }

    interface Ruby extends Fern.RubySdkRequest {
        type: "ruby";
    }

    interface Java extends Fern.JavaSdkRequest {
        type: "java";
    }
}
