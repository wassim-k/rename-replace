# Rename / Replace

Rename files & folders recursively and replace their content while preserving the original casing.

## Features
* **Replace** action for refactoring existing code with ease.
* **Duplicate** action for starting a new feature that has a similar folder structure to an existing feature.
* Supports the following letter casings:
  * camel
  * pascal
  * constant
  * header
  * kebab
  * sentence
  * snake
  * title
  * upper
  * lower

## Configuration

### exclude
List of folders or files to exclude.

#### default:
```json
"rename-replace.exclude": [
  "node_modules",
  ".git",
  ".cache"
]
```

## Demo
![Demo](https://github.com/wassim-k/rename-replace/blob/main/media/demo_scaled.gif?raw=true)


## CLI
For the same functionality outside of VSCode, you can use the [CLI tool](https://www.npmjs.com/package/rename-replace).  
```bash
npx rename-replace -h
```

> ⚠️ There are instances when VSCode may lock files, leading to the extension timing out with an error after several attempts. If you encounter this issue, it's recommended to close VSCode and use the CLI tool directly from the command line as an alternative solution.
