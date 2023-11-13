import { RenamePath, Target, hasTarget } from 'rename-replace';


export function getReport(paths: Array<RenamePath>): string {
    const segments = Array.from(iterate());

    if (segments.length === 0) {
        return 'No matching files or folders were found.';
    } else if (segments.length === 1) {
        return capitalize(segments[0]);
    } else {
        const lastSegment = segments.pop();
        segments[0] = capitalize(segments[0]);
        return `${segments.join(', ')} & ${lastSegment}`;
    }

    function* iterate(): Iterable<string> {
        const folders = paths.filter(p => hasTarget(p.target, Target.Folder));
        const files = paths.filter(p => hasTarget(p.target, Target.File));
        const contents = paths.filter(p => hasTarget(p.target, Target.Content));

        if (folders.length === 1) yield `${folders.length} folder renamed`;
        else if (folders.length > 1) yield `${folders.length} folders renamed`;

        if (files.length === 1) yield `${files.length} file renamed`;
        else if (files.length > 1) yield `${files.length} files renamed`;

        if (contents.length === 1) yield `${contents.length} content replaced`;
        else if (contents.length > 1) yield `${contents.length} contents replaced`;
    }
}

function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.substring(1);
}
