import { Volume } from "memfs/lib/volume";
import path from "path";
import { Project } from "ts-morph";

export async function writeProjectToVolume(
    project: Project,
    volume: Volume,
    directoryOnVolume: `/${string}`
): Promise<void> {
    for (const file of project.getSourceFiles()) {
        const filepath = path.join(directoryOnVolume, file.getFilePath());
        await volume.promises.mkdir(path.dirname(filepath), { recursive: true });
        await volume.promises.writeFile(filepath, file.getFullText());
    }
}
