import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { GameMode } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';
import { Trophy, Filter } from 'lucide-react';

const Leaderboard = () => {
  const [filterMode, setFilterMode] = useState<GameMode | undefined>(undefined);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="w-10 h-10 text-yellow-400" />
              <h1 className="font-pixel text-4xl text-foreground">
                LEADERBOARD
              </h1>
            </div>
            <p className="text-muted-foreground">
              Top players from around the world
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="font-pixel text-sm text-muted-foreground mr-2">FILTER:</span>
            
            <button
              onClick={() => setFilterMode(undefined)}
              className={cn(
                'font-pixel text-sm px-4 py-2 rounded-lg border transition-all',
                !filterMode
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              ALL
            </button>
            
            <button
              onClick={() => setFilterMode('walls')}
              className={cn(
                'font-pixel text-sm px-4 py-2 rounded-lg border transition-all',
                filterMode === 'walls'
                  ? 'border-secondary bg-secondary/10 text-secondary'
                  : 'border-border text-muted-foreground hover:border-secondary/50'
              )}
            >
              WALLS
            </button>
            
            <button
              onClick={() => setFilterMode('pass-through')}
              className={cn(
                'font-pixel text-sm px-4 py-2 rounded-lg border transition-all',
                filterMode === 'pass-through'
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted-foreground hover:border-accent/50'
              )}
            >
              PASS-THROUGH
            </button>
          </div>

          {/* Leaderboard table */}
          <LeaderboardTable filterMode={filterMode} />
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
