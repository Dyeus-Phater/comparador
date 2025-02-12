import { Card } from '@/components/ui/card';
import { diffLines, Change } from 'diff';

interface StatisticsProps {
  original: string;
  translated: string;
}

interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}

export default function Statistics({ original, translated }: StatisticsProps) {
  const diffs = diffLines(original || '', translated || '');

  const stats = diffs.reduce((acc: DiffStats, diff: Change) => {
    if (diff.added) acc.added += diff.count || 0;
    if (diff.removed) acc.removed += diff.count || 0;
    if (!diff.added && !diff.removed) acc.unchanged += diff.count || 0;
    return acc;
  }, { added: 0, removed: 0, unchanged: 0 });

  return (
    <Card className="p-4 mt-4">
      <h3 className="text-sm font-semibold mb-2">Statistics</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Added lines:</span>
          <span className="text-green-600">{stats.added}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Removed lines:</span>
          <span className="text-red-600">{stats.removed}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Unchanged lines:</span>
          <span>{stats.unchanged}</span>
        </div>
      </div>
    </Card>
  );
}
