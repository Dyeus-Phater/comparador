import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LayoutTemplate, Layout, Link2, Link2Off } from 'lucide-react';

interface ControlPanelProps {
  layout: 'horizontal' | 'vertical';
  setLayout: (layout: 'horizontal' | 'vertical') => void;
  syncScroll: boolean;
  setSyncScroll: (sync: boolean) => void;
}

export default function ControlPanel({
  layout,
  setLayout,
  syncScroll,
  setSyncScroll
}: ControlPanelProps) {
  return (
    <Card className="p-4 mt-4">
      <h3 className="text-sm font-semibold mb-2">Controls</h3>

      <div className="flex gap-2">
        <Button
          variant={layout === 'horizontal' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLayout('horizontal')}
        >
          <LayoutTemplate className="h-4 w-4 mr-2" />
          Horizontal
        </Button>

        <Button
          variant={layout === 'vertical' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLayout('vertical')}
        >
          <Layout className="h-4 w-4 mr-2" />
          Vertical
        </Button>
      </div>

      <Button
        variant={syncScroll ? 'default' : 'outline'}
        size="sm"
        className="mt-2 w-full"
        onClick={() => setSyncScroll(!syncScroll)}
      >
        {syncScroll ? (
          <Link2 className="h-4 w-4 mr-2" />
        ) : (
          <Link2Off className="h-4 w-4 mr-2" />
        )}
        {syncScroll ? 'Sync Scroll On' : 'Sync Scroll Off'}
      </Button>
    </Card>
  );
}
