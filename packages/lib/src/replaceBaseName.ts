import path from 'path';
import { replace } from './replacements';
import { Replacement } from './types';

export function replaceBaseName(replacePath: string, replacements: Array<Replacement>) {
    const baseName = path.basename(replacePath);
    const newBaseName = replace(baseName, replacements);
    return path.join(path.dirname(replacePath), newBaseName);
}
