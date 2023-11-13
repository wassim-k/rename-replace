import fs from 'fs-extra';
import path from 'path';
import { hasTarget } from './targets';
import { RenamePath, Replacement, Target } from './types';

export async function searchPath(targetPath: { path: string, name: string, isDirectory: () => boolean }, replacements: Array<Replacement>, target: Target, exclude: Array<string>): Promise<Array<RenamePath>> {
    const results: Array<RenamePath> = [];

    if (exclude.includes(targetPath.name)) return [];

    if (targetPath.isDirectory()) {
        if (hasTarget(target, Target.Folder) && nameContainsWords(targetPath.name, replacements)) {
            results.push({ path: targetPath.path, target: Target.Folder });
        }

        const children = await fs.readdir(targetPath.path, { withFileTypes: true });
        for (const child of children) {
            results.push(...await searchPath({ path: path.join(targetPath.path, child.name), name: child.name, isDirectory: child.isDirectory.bind(child) }, replacements, target, exclude));
        }
    } else {
        let pathTarget = Target.None;

        if (hasTarget(target, Target.File) && nameContainsWords(targetPath.name, replacements)) pathTarget |= Target.File;
        if (hasTarget(target, Target.Content) && await contentContainsWords(targetPath.path, replacements)) pathTarget |= Target.Content;

        if (pathTarget !== Target.None) {
            results.push({ path: targetPath.path, target: pathTarget });
        }
    }

    return results;
}

function nameContainsWords(name: string, replacements: Array<Replacement>): boolean {
    return replacements.some(({ from }) => name.includes(from));
}

async function contentContainsWords(filePath: string, replacements: Array<Replacement>): Promise<boolean> {
    const content = await fs.readFile(filePath, 'utf8');
    return replacements.some(({ from }) => content.includes(from));
}
