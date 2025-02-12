import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type FileVersion, type Version, canUndo, canRedo } from '@/lib/versionHistory';
import { RotateCcw, RotateCw, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryProps {
  fileVersion: FileVersion;
  onUndo: () => void;
  onRedo: () => void;
  onVersionSelect: (version: Version) => void;
}

export default function VersionHistory({
  fileVersion,
  onUndo,
  onRedo,
  onVersionSelect,
}: VersionHistoryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <History className="h-4 w-4" />
          Version History
        </h3>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={!canUndo(fileVersion)}
            onClick={onUndo}
            title="Undo"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={!canRedo(fileVersion)}
            onClick={onRedo}
            title="Redo"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {fileVersion.versions.map((version: Version, index: number) => (
            <button
              key={version.timestamp}
              className={`w-full text-left p-2 rounded text-sm transition-colors ${
                index === fileVersion.currentIndex
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onVersionSelect(version)}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium">{version.description}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(version.timestamp, { addSuffix: true })}
                </span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
