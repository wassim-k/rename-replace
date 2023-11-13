import { Target } from './types';

export function hasTarget<TComparand extends Target>(target: Target, comparand: TComparand): target is TComparand {
    return (target & comparand) === comparand;
}

export function getTargetNames(target: Target): Array<string> {
    return Array.from(iterate());

    function* iterate(): Iterable<string> {
        if (hasTarget(target, Target.Folder)) yield 'folder';
        if (hasTarget(target, Target.File)) yield 'file';
        if (hasTarget(target, Target.Content)) yield 'content';
    }
}

export function parseTargetNames(names: Array<string>): Target {
    let target = Target.None;
    if (names.includes('folder')) target |= Target.Folder;
    if (names.includes('file')) target |= Target.File;
    if (names.includes('content')) target |= Target.Content;
    return target;
}
