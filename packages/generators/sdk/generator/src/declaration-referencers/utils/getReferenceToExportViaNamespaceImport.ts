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

export function getReferenceToExportViaNamespaceImport({
    exportedName,
    directoryToNamespaceImport,
    filepathInsideNamespaceImport,
    namespaceImport,
    addImport,
    referencedIn,
}: {
    exportedName: string;
    directoryToNamespaceImport: ExportedDirectory[];
    filepathInsideNamespaceImport: ExportedDirectory[] | ExportedFilePath | undefined;
    namespaceImport: string;
    addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
    referencedIn: SourceFile;
}): Reference {
    addImport(
        getRelativePathAsModuleSpecifierTo(
            referencedIn,
            convertExportedDirectoryPathToFilePath(directoryToNamespaceImport)
        ),
        { namespaceImport }
    );

    const pathToDirectoryInsideNamespaceImport =
        filepathInsideNamespaceImport != null
            ? Array.isArray(filepathInsideNamespaceImport)
                ? filepathInsideNamespaceImport
                : filepathInsideNamespaceImport.directories
            : [];

    const entityName = ts.factory.createQualifiedName(
        getEntityNameOfDirectory({
            pathToDirectory: pathToDirectoryInsideNamespaceImport,
            prefix: ts.factory.createIdentifier(namespaceImport),
        }),
        exportedName
    );

    return {
        typeNode: ts.factory.createTypeReferenceNode(entityName),
        entityName,
        expression: ts.factory.createPropertyAccessExpression(
            getExpressionToDirectory({
                pathToDirectory: pathToDirectoryInsideNamespaceImport,
                prefix: ts.factory.createIdentifier(namespaceImport),
            }),
            exportedName
        ),
    };
}
