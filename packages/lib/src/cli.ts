#!/usr/bin/env node

import { Option, program } from 'commander';
import { EOL } from 'os';
import path from 'path';
import { excludeDefault } from './constants';
import { renameReplace } from './index';
import { generateReplacements } from './replacements';
import { getTargetNames } from './targets';
import { Casing, Target } from './types';

export interface CliOptions {
    duplicate?: boolean;
    exclude: Array<string>;
    exact?: boolean;
    target: Array<'all' | 'file' | 'folder' | 'content'>;
    camel?: boolean;
    constant?: boolean;
    header?: boolean;
    kebab?: boolean;
    pascal?: boolean;
    sentence?: boolean;
    snake?: boolean;
    title?: boolean;
    upper?: boolean;
    lower?: boolean;
}

const { description, version } = require(path.join(__dirname, '..', 'package.json')); // eslint-disable-line @typescript-eslint/no-var-requires

program
    .name('rename-replace')
    .argument('<path>', 'Path of folder/file to rename')
    .argument('<from>', 'Rename from')
    .argument('<to>', 'Rename to')
    .addOption(new Option('--target <targets...>', 'Rename target').choices(['all', 'folder', 'file', 'content']).default('all'))
    .option('--duplicate', 'Duplicates folder/file instead of renaming in-place')
    .option('--exclude <folder/file names...>', 'Exclude folders/files by name', excludeDefault)
    .option('--exact', 'Exact case. Match input as is.')
    .option('--camel', 'camelCase')
    .option('--constant', 'CONSTANT_CASE')
    .option('--header', 'Header-Case')
    .option('--kebab', 'kebab-case')
    .option('--pascal', 'PascalCase')
    .option('--sentence', 'Sentence case')
    .option('--snake', 'snake_case')
    .option('--title', 'Title Case')
    .option('--upper', 'UPPER CASE')
    .option('--lower', 'lower case')
    .description(description)
    .version(version, '-v --version')
    .parse();

const args = program.args;
const cliOptions = program.opts<CliOptions>();

if (program.args.length === 0) {
    program.help();
}

(async () => {
    const replacements = generateReplacements(args[1], args[2], getCasing(cliOptions));

    console.log('Replacements:');
    console.log(replacements.map(({ from, to, casing }) => `[${casing}] ${from} => ${to}`).join('\r\n'));
    console.log(EOL);

    const paths = await renameReplace(args[0], replacements, {
        exclude: cliOptions.exclude,
        target: getTarget(cliOptions),
        duplicate: cliOptions.duplicate
    });

    console.log('Paths:');
    if (paths.length > 0) {
        console.log(paths.map(p => `[${getTargetNames(p.target).join(', ')}]: ${p.path}`).join(EOL));
    } else {
        console.log('None were found');
    }

    process.exit(0);
})();


function getCasing(options: CliOptions) {
    const { exact, camel, constant, header, kebab, pascal, sentence, snake, title, upper, lower } = options;
    const casingMap: Record<Casing, boolean | undefined> = { exact, camel, constant, header, kebab, pascal, sentence, snake, title, upper, lower };
    return (Object.entries(casingMap) as Array<[Casing, boolean | undefined]>)
        .reduce<Array<Casing>>((acc, [key, value]) => value ? [...acc, key] : acc, []);
}

function getTarget(options: CliOptions): Target {
    let target: Target = Target.None;
    if (options.target.includes('all')) return Target.All;
    if (options.target.includes('folder')) target |= Target.Folder;
    if (options.target.includes('file')) target |= Target.File;
    if (options.target.includes('content')) target |= Target.Content;
    return target;
}
