import { getRelativePathAsModuleSpecifierTo } from "@fern-typescript/commons";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { SourceFile, ts } from "ts-morph";
import {
    convertExportedDirectoryPathToFilePath,
    ExportedDirectory,
    ExportedFilePath,
} from "../../exports-manager/ExportedFilePath";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../../utils/ModuleSpecifier";
import { getEntityNameOfDirectory } from "./getEntityNameOfDirectory";
import { getExpressionToDirectory } from "./getExpressionToDirectory";

export declare namespace getReferenceToExportFromRoot {
    export interface Args {
        referencedIn: SourceFile;
        exportedName: string;
        exportedFromPath: ExportedFilePath;
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        namespaceImport: string;
        subImport?: string[];
    }
}

export function getReferenceToExportFromRoot({
    exportedName,
    exportedFromPath,
    addImport,
    referencedIn,
    namespaceImport,
    subImport = [],
}: getReferenceToExportFromRoot.Args): Reference {
    let prefix: ts.Identifier | undefined;

    const directoryToImportDirectlyFrom: ExportedDirectory[] = [];

    // find the first namespace-exported directory
    for (const directory of exportedFromPath.directories) {
        if (directory.exportDeclaration != null) {
            const { exportAll = false, namespaceExport } = directory.exportDeclaration;
            if (exportAll || namespaceExport != null) {
                break;
            }
        }
        directoryToImportDirectlyFrom.push(directory);
    }

    const directoriesInsideNamespaceExport = exportedFromPath.directories.slice(directoryToImportDirectlyFrom.length);
    const firstDirectoryInsideNamespaceExport = directoriesInsideNamespaceExport[0];

    if (firstDirectoryInsideNamespaceExport?.exportDeclaration?.namespaceExport == null) {
        const directoryToImportAsNamespace = directoryToImportDirectlyFrom;
        if (firstDirectoryInsideNamespaceExport != null) {
            directoryToImportAsNamespace.push(firstDirectoryInsideNamespaceExport);
        }
        const moduleSpecifier = getRelativePathAsModuleSpecifierTo(
            referencedIn,
            convertExportedDirectoryPathToFilePath(directoryToImportAsNamespace)
        );
        addImport(moduleSpecifier, { namespaceImport });

        prefix = ts.factory.createIdentifier(namespaceImport);
        directoriesInsideNamespaceExport.shift();
    } else {
        const moduleSpecifier = getRelativePathAsModuleSpecifierTo(
            referencedIn,
            convertExportedDirectoryPathToFilePath(directoryToImportDirectlyFrom)
        );
        addImport(moduleSpecifier, {
            namedImports: [firstDirectoryInsideNamespaceExport.exportDeclaration.namespaceExport],
        });
    }

    const entityName = [exportedName, ...subImport].reduce<ts.EntityName>(
        (acc, part) => ts.factory.createQualifiedName(acc, part),
        getEntityNameOfDirectory({
            pathToDirectory: directoriesInsideNamespaceExport,
            prefix,
        })
    );

    const expression = [exportedName, ...subImport].reduce<ts.Expression>(
        (acc, part) => ts.factory.createPropertyAccessExpression(acc, part),
        getExpressionToDirectory({
            pathToDirectory: directoriesInsideNamespaceExport,
            prefix,
        })
    );

    return {
        typeNode: ts.factory.createTypeReferenceNode(entityName),
        entityName,
        expression,
    };
}
