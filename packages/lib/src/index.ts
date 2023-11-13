import fs from 'fs-extra';
import path from 'path';
import { excludeDefault } from './constants';
import { renamePaths } from './renamePaths';
import { replaceBaseName } from './replaceBaseName';
import { searchPath } from './searchPath';
import { Options, RenamePath, Replacement, Target } from './types';
export { generateReplacements } from './replacements';
export { getTargetNames, hasTarget, parseTargetNames } from './targets';
export { Casing, Options, RenamePath, Replacement, Target } from './types';

export async function renameReplace(basePath: string, replacements: Array<Replacement>, options?: Options): Promise<Array<RenamePath>> {
    const exclude = options?.exclude ?? excludeDefault;
    const target = options?.target ?? Target.All;
    replacements = replacements.reduce<Array<Replacement>>(
        (acc, replacement) => acc.some(r => r.from === replacement.from) ? acc : [...acc, replacement],
        []);

    const duplicate = options?.duplicate === true;

    if (duplicate) {
        const newBasePath = replaceBaseName(basePath, replacements);

        if (basePath === newBasePath) {
            throw new Error('Duplicate operation requires that the target folder/file name differs after renaming.');
        }

        await fs.copy(basePath, newBasePath, { filter: (src, _dest) => !exclude.includes(path.basename(src)) });

        basePath = newBasePath;
    }

    const stats = await fs.stat(basePath);
    let paths = await searchPath({ path: basePath, name: path.basename(basePath), isDirectory: stats.isDirectory.bind(stats) }, replacements, target, exclude);

    if (duplicate) {
        // Skip root path as it already exists.
        paths = paths.map<RenamePath>(p => p.path === basePath ? { ...p, skip: true } : p);
    }

    await renamePaths(paths, replacements);

    return paths;
}
