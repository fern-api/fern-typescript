import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { CoreUtilities } from "@fern-typescript/sdk-declaration-handler";
import { cp } from "fs/promises";
import path from "path";
import { SourceFile } from "ts-morph";
import { getReferenceToExportViaNamespaceImport } from "../declaration-referencers/utils/getReferenceToExportViaNamespaceImport";
import { ExportedDirectory } from "../exports-manager/ExportedFilePath";
import { ExportsManager } from "../exports-manager/ExportsManager";
import { ImportDeclaration } from "../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../utils/ModuleSpecifier";
import { CoreUtility, CoreUtilityName } from "./CoreUtility";
import { ZurgImpl } from "./implementations/ZurgImpl";

const CORE_UTILITIES_FILEPATH: ExportedDirectory[] = [{ nameOnDisk: "core" }];

export declare namespace CoreUtilitiesManager {
    namespace getCoreUtilities {
        interface Args {
            sourceFile: SourceFile;
            addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        }
    }
}

export class CoreUtilitiesManager {
    private referencedCoreUtilities: Record<CoreUtilityName, CoreUtility.Manifest> = {};

    public getCoreUtilities({ sourceFile, addImport }: CoreUtilitiesManager.getCoreUtilities.Args): CoreUtilities {
        const getReferenceToExport = this.createGetReferenceToExport({ sourceFile, addImport });
        return {
            zurg: new ZurgImpl({ getReferenceToExport }),
        };
    }

    public addExports(exportsManager: ExportsManager): void {
        for (const utility of Object.values(this.referencedCoreUtilities)) {
            exportsManager.addExportsForDirectories(getPathToUtility(utility));
        }
    }

    public async copyCoreUtilities({ pathToPackage }: { pathToPackage: AbsoluteFilePath }): Promise<void> {
        await Promise.all(
            [...Object.values(this.referencedCoreUtilities)].map((utility) =>
                cp(
                    process.env.NODE_ENV === "test"
                        ? path.join(__dirname, "../../../../../..", utility.originalPathInRepo)
                        : utility.originalPathOnDocker,
                    join(
                        pathToPackage,
                        ...getPathToUtility(utility).map((directory) => RelativeFilePath.of(directory.nameOnDisk))
                    ),
                    { recursive: true }
                )
            )
        );
    }

    private createGetReferenceToExport({ sourceFile, addImport }: CoreUtilitiesManager.getCoreUtilities.Args) {
        return ({ manifest, exportedName }: { manifest: CoreUtility.Manifest; exportedName: string }) => {
            this.referencedCoreUtilities[manifest.name] = manifest;
            return getReferenceToExportViaNamespaceImport({
                exportedName,
                filepathInsideNamespaceImport: manifest.pathInCoreUtilities,
                directoryToNamespaceImport: CORE_UTILITIES_FILEPATH,
                namespaceImport: "core",
                referencedIn: sourceFile,
                addImport: (moduleSpecifier, importDeclaration) => {
                    addImport(moduleSpecifier, importDeclaration);
                },
            });
        };
    }
}

function getPathToUtility(utility: CoreUtility.Manifest): ExportedDirectory[] {
    return [...CORE_UTILITIES_FILEPATH, ...utility.pathInCoreUtilities];
}
