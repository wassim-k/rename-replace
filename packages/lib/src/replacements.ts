import { camelCase, capitalCase, constantCase, headerCase, paramCase, pascalCase, sentenceCase, snakeCase } from 'change-case';
import { Casing, Replacement } from './types';

export function generateReplacements(from: string, to: string, casing?: Array<Casing>): Array<Replacement & { casing: Casing; }> {
    return Array.from(iterate());

    function* iterate(): Iterable<Replacement & { casing: Casing; }> {
        const all = casing === undefined || casing.length === 0;
        if (all || casing.includes('exact')) yield { from, to, casing: 'exact' };
        if (all || casing.includes('camel')) yield { from: camelCase(from), to: camelCase(to), casing: 'camel' };
        if (all || casing.includes('pascal')) yield { from: pascalCase(from), to: pascalCase(to), casing: 'pascal' };
        if (all || casing.includes('constant')) yield { from: constantCase(from), to: constantCase(to), casing: 'constant' };
        if (all || casing.includes('header')) yield { from: headerCase(from), to: headerCase(to), casing: 'header' };
        if (all || casing.includes('kebab')) yield { from: paramCase(from), to: paramCase(to), casing: 'kebab' };
        if (all || casing.includes('sentence')) yield { from: sentenceCase(from), to: sentenceCase(to), casing: 'sentence' };
        if (all || casing.includes('sentence')) yield { from: sentenceCase(from).toLowerCase(), to: sentenceCase(to).toLowerCase(), casing: 'sentence' };
        if (all || casing.includes('snake')) yield { from: snakeCase(from), to: snakeCase(to), casing: 'snake' };
        if (all || casing.includes('title')) yield { from: capitalCase(from), to: capitalCase(to), casing: 'title' };
        if (all || casing.includes('upper')) yield { from: from.toUpperCase(), to: to.toUpperCase(), casing: 'upper' };
        if (all || casing.includes('lower')) yield { from: from.toLowerCase(), to: to.toLowerCase(), casing: 'lower' };
    }
}

export function replace(text: string, replacements: Array<Replacement>): string {
    return replacements.reduce((acc, { from, to }) => acc.replaceAll(from, to), text);
}
