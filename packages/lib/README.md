# rename-replace

## CLI

### Installation
```shell
npm i -g rename-replace
```
OR
```shell
npx rename-replace -h
```

### CLI Options
```shell
Usage: rename-replace [options] <path> <from> <to>

Rename files & folders recursively and replace their content while preserving their original casing.

Arguments:
  path                              Path of folder/file to rename
  from                              Rename from
  to                                Rename to

Options:
  --target <targets...>             Rename target (choices: "all", "folder", "file", "content", default: "all")
  --duplicate                       Duplicates folder/file instead of renaming in-place
  --exclude <folder/file names...>  Exclude folders/files by name (default: ["node_modules",".git",".cache"])
  --exact                           Exact case. Match input as is.
  --camel                           camelCase
  --constant                        CONSTANT_CASE
  --header                          Header-Case
  --kebab                           kebab-case
  --pascal                          PascalCase
  --sentence                        Sentence case
  --snake                           snake_case
  --title                           Title Case
  --upper                           UPPER CASE
  --lower                           lower case
  -v --version                      output the version number
  -h, --help                        display help for command
```

### Output
```shell
$ rename-replace C:\Code\PlainOldName PlainOldName BrandNewName

Replacements:
[exact] PlainOldName => BrandNewName
[camel] plainOldName => brandNewName
[pascal] PlainOldName => BrandNewName
[constant] PLAIN_OLD_NAME => BRAND_NEW_NAME
[header] Plain-Old-Name => Brand-New-Name
[kebab] plain-old-name => brand-new-name
[sentence] Plain old name => Brand new name
[sentence] plain old name => brand new name
[snake] plain_old_name => brand_new_name
[title] Plain Old Name => Brand New Name
[upper] PLAINOLDNAME => BRANDNEWNAME
[lower] plainoldname => brandnewname


Paths:
[folder]: C:\Code\PlainOldName
[folder]: C:\Code\PlainOldName\plain-old-name-folder
[file, content]: C:\Code\PlainOldName\plain-old-name-folder\plain-old-name-file-with-content.ts
[file]: C:\Code\PlainOldName\plain-old-name-folder\plain-old-name-file.ts
[file]: C:\Code\PlainOldName\plainOldName.ts
```

## Library

### Installation
```shell
npm i rename-replace
```

### Usage
```typescript
import { generateReplacements, renameReplace, Target } from 'rename-replace';

const replacements = generateReplacements('RenameFromThis', 'RenameToThis');
await renameReplace('/path/to/folder/or/file', replacements);
```

### API
```typescript
function generateReplacements(from: string, to: string, casing?: Array<'exact' | 'camel' | 'constant' | 'header' | 'kebab' | 'pascal' | 'sentence' | 'snake' | 'title' | 'upper' | 'lower'>): Array<Replacement>

async function renameReplace(basePath: string, replacements: Array<Replacement>, options?: Options): Promise<Array<RenamePath>>
```

## WARNING
If the target of a renamed file already exists, then it will be overwritten. Please use with caution and stage or commit your code before a `rename-replace` operation.  
If the target of a renamed folder already exists, then the contents will be merged.
