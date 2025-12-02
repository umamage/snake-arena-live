import { cn } from '@/lib/utils';
import { GameMode } from '@/lib/gameLogic';
import { Boxes, ArrowRightLeft } from 'lucide-react';

interface ModeSelectorProps {
  selectedMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export function ModeSelector({ selectedMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => onModeChange('walls')}
        className={cn(
          'flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all',
          'hover:scale-105 cursor-pointer',
          selectedMode === 'walls'
            ? 'border-secondary bg-secondary/10 neon-border-secondary'
            : 'border-border hover:border-secondary/50'
        )}
      >
        <Boxes className={cn(
          'w-10 h-10',
          selectedMode === 'walls' ? 'text-secondary' : 'text-muted-foreground'
        )} />
        <div className="text-center">
          <p className={cn(
            'font-pixel text-lg',
            selectedMode === 'walls' ? 'text-secondary neon-text-secondary' : 'text-foreground'
          )}>
            WALLS
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Hit walls = Game Over
          </p>
        </div>
      </button>

      <button
        onClick={() => onModeChange('pass-through')}
        className={cn(
          'flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all',
          'hover:scale-105 cursor-pointer',
          selectedMode === 'pass-through'
            ? 'border-accent bg-accent/10 shadow-[0_0_20px_hsl(180_100%_50%/0.3)]'
            : 'border-border hover:border-accent/50'
        )}
      >
        <ArrowRightLeft className={cn(
          'w-10 h-10',
          selectedMode === 'pass-through' ? 'text-accent' : 'text-muted-foreground'
        )} />
        <div className="text-center">
          <p className={cn(
            'font-pixel text-lg',
            selectedMode === 'pass-through' ? 'text-accent neon-text-accent' : 'text-foreground'
          )}>
            PASS-THROUGH
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Wrap around edges
          </p>
        </div>
      </button>
    </div>
  );
}
