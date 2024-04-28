/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../..";
import * as Fern from "../../../../api";
import * as core from "../../../../core";
import { TypeScriptSdk } from "./TypeScriptSdk";
import { PythonSdk } from "./PythonSdk";
import { GoSdk } from "./GoSdk";
import { RubySdk } from "./RubySdk";
import { JavaSdk } from "./JavaSdk";

export const Sdk: core.serialization.Schema<serializers.Sdk.Raw, Fern.Sdk> = core.serialization
    .union("type", {
        typescript: TypeScriptSdk,
        python: PythonSdk,
        go: GoSdk,
        ruby: RubySdk,
        java: JavaSdk,
    })
    .transform<Fern.Sdk>({
        transform: (value) => value,
        untransform: (value) => value,
    });

export declare namespace Sdk {
    type Raw = Sdk.Typescript | Sdk.Python | Sdk.Go | Sdk.Ruby | Sdk.Java;

    interface Typescript extends TypeScriptSdk.Raw {
        type: "typescript";
    }

    interface Python extends PythonSdk.Raw {
        type: "python";
    }

    interface Go extends GoSdk.Raw {
        type: "go";
    }

    interface Ruby extends RubySdk.Raw {
        type: "ruby";
    }

    interface Java extends JavaSdk.Raw {
        type: "java";
    }
}
