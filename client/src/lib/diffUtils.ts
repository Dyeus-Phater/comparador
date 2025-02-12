import { diffLines, diffChars, Change } from 'diff';

export interface DiffResult {
  added: number;
  removed: number;
  unchanged: number;
}

export function getLineDiffs(original: string, translated: string): DiffResult {
  const diffs = diffLines(original, translated);

  return diffs.reduce((acc: DiffResult, diff: Change) => {
    if (diff.added) acc.added += diff.count || 0;
    if (diff.removed) acc.removed += diff.count || 0;
    if (!diff.added && !diff.removed) acc.unchanged += diff.count || 0;
    return acc;
  }, { added: 0, removed: 0, unchanged: 0 });
}

export function getCharDiffs(original: string, translated: string): DiffResult {
  const diffs = diffChars(original, translated);

  return diffs.reduce((acc: DiffResult, diff: Change) => {
    if (diff.added) acc.added += diff.value.length;
    if (diff.removed) acc.removed += diff.value.length;
    if (!diff.added && !diff.removed) acc.unchanged += diff.value.length;
    return acc;
  }, { added: 0, removed: 0, unchanged: 0 });
}
