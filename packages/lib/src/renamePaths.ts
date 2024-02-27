import fs from 'fs-extra';
import path from 'path';
import { renameFolder } from './renameFolder';
import { replaceBaseName } from './replaceBaseName';
import { replace } from './replacements';
import { hasTarget } from './targets';
import { RenamePath, Replacement, Target } from './types';

export async function renamePaths(paths: Array<RenamePath>, replacements: Array<Replacement>): Promise<void> {
    for (const { path } of paths.filter(f => hasTarget(f.target, Target.Content))) {
        const fileContent = await fs.readFile(path, 'utf8');
        await fs.writeFile(path, replace(fileContent, replacements));
    }

    let pathsToRename = [...paths];
    let pathToRename: RenamePath | undefined;

    while (pathToRename = pathsToRename.shift()) {
        const { path: replacePath, target: replaceTarget, skip } = pathToRename;

        if (skip) continue;

        const newPath = replaceBaseName(replacePath, replacements);

        if (hasTarget(replaceTarget, Target.File)) {
            await fs.rename(replacePath, newPath);
        } else if (hasTarget(replaceTarget, Target.Folder)) {
            await renameFolder(replacePath, newPath);
            pathsToRename = pathsToRename.map(({ target, path: p }) => ({ target, path: replaceStartOfPath(p, replacePath, newPath) }));
        }
    }
}

function replaceStartOfPath(originalPath: string, pathToReplace: string, newPath: string): string {
    const replacement = pathToReplace + path.sep;
    return originalPath.startsWith(replacement)
        ? (newPath + path.sep) + originalPath.substring(replacement.length)
        : originalPath;
}
