import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { getExportedDirectoriesForFernFilepath } from "./utils/getExportedDirectoriesForFernFilepath";

export class ServiceDeclarationReferencer extends AbstractDeclarationReferencer<DeclaredServiceName> {
    public getExportedFilepath(serviceName: DeclaredServiceName): ExportedFilePath {
        return {
            directories: [
                ...this.containingDirectory,
                ...getExportedDirectoriesForFernFilepath({
                    fernFilepath: serviceName.fernFilepath,
                }),
            ],
            file: {
                nameOnDisk: "client",
                exportDeclaration: { exportAll: true },
            },
        };
    }

    public getFilename(serviceName: DeclaredTypeName): string {
        return `${serviceName.name}.ts`;
    }

    public getExportedName(): string {
        return "Client";
    }
}
