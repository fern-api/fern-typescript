import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { getExportedDirectoriesForFernFilepath } from "./utils/getExportedDirectoriesForFernFilepath";

export class SchemaDeclarationReferencer extends AbstractDeclarationReferencer<DeclaredTypeName> {
    public getExportedFilepath(typeName: DeclaredTypeName): ExportedFilePath {
        return {
            directories: [
                ...this.containingDirectory,
                ...getExportedDirectoriesForFernFilepath({
                    fernFilepath: typeName.fernFilepath,
                }),
            ],
            file: {
                nameOnDisk: this.getFilename(typeName),
                exportDeclaration: { exportAll: true },
            },
        };
    }

    public getFilename(typeName: DeclaredTypeName): string {
        return `${this.getExportedName(typeName)}.ts`;
    }

    public getExportedName(typeName: DeclaredTypeName): string {
        return typeName.name;
    }
}
