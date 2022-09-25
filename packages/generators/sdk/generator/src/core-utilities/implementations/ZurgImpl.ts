import { RelativeFilePath } from "@fern-api/core-utils";
import { Reference, Zurg } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { CoreUtility } from "../CoreUtility";

export class ZurgImpl extends CoreUtility implements Zurg {
    public readonly MANIFEST = {
        name: "zurg",
        originalPathInRepo: RelativeFilePath.of("packages/zurg/src"),
        originalPathOnDocker: "/assets/zurg" as const,
        pathInCoreUtilities: [{ nameOnDisk: "schemas", exportDeclaration: { namespaceExport: "schemas" } }],
    };

    public object = (): never => {
        throw new Error("Not implmemented");
    };

    public list = (): never => {
        throw new Error("Not implmemented");
    };

    public string = this.withExportedName("string", (string: Reference) => () => {
        return {
            toExpression: () => ts.factory.createCallExpression(string.expression, undefined, undefined),
        };
    });

    public number = (): never => {
        throw new Error("Not implmemented");
    };

    public boolean = (): never => {
        throw new Error("Not implmemented");
    };
}
