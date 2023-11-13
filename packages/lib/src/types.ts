export type Casing = 'exact' | 'camel' | 'constant' | 'header' | 'kebab' | 'pascal' | 'sentence' | 'snake' | 'title' | 'upper' | 'lower';

export type Replacement = { from: string, to: string };

export interface Options {
    duplicate?: boolean;
    target?: Target;
    exclude?: Array<string>;
}

export interface RenamePath {
    target: Target;
    path: string;
    skip?: boolean;
}

export enum Target {
    None = 0,
    Folder = 1 << 0,
    File = 1 << 1,
    Content = 1 << 2,
    All = ~(~0 << 3)
}
