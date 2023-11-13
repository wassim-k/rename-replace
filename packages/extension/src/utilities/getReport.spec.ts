import { describe, expect, test } from '@jest/globals';
import { Target } from 'rename-replace';
import { getReport } from './getReport';

describe('getReport', () => {
    test('should generate report when 3 are present', () => {
        const actual = getReport([
            { path: '/folder', target: Target.Folder },
            { path: '/folder2', target: Target.Folder },
            { path: '/folder/file', target: Target.File | Target.Content },
            { path: '/folder/file2', target: Target.File | Target.Content },
            { path: '/folder/file3', target: Target.Content }
        ]);
        expect(actual).toBe('2 folders renamed, 2 files renamed & 3 contents replaced');
    });

    test('should generate report when 2 are present', () => {
        const actual = getReport([
            { path: '/folder', target: Target.Folder },
            { path: '/folder/file', target: Target.File }
        ]);
        expect(actual).toBe('1 folder renamed & 1 file renamed');
    });

    test('should generate report when 1 is present', () => {
        const actual = getReport([
            { path: '/folder/file', target: Target.File }
        ]);
        expect(actual).toBe('1 file renamed');
    });

    test('should generate report when none are present', () => {
        const actual = getReport([]);
        expect(actual).toBe('No matching files or folders were found.');
    });
});
