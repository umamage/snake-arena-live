import { useState, useCallback } from 'react';
import { GameBoard } from '@/components/GameBoard';
import { ModeSelector } from '@/components/ModeSelector';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { leaderboardApi } from '@/services/mockApi';
import { GameMode } from '@/lib/gameLogic';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Play, RotateCcw } from 'lucide-react';

const Index = () => {
  const [gameMode, setGameMode] = useState<GameMode>('walls');
  const [gameKey, setGameKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const { user } = useAuth();

  const handleGameOver = useCallback(async (score: number) => {
    setLastScore(score);
    setIsPlaying(false);

    if (user && score > 0) {
      const result = await leaderboardApi.submitScore(score, gameMode);
      if (result.success && result.rank) {
        toast({
          title: 'Score submitted!',
          description: `You ranked #${result.rank} on the leaderboard!`,
        });
      }
    }
  }, [user, gameMode]);

  const startGame = () => {
    setIsPlaying(true);
    setLastScore(null);
    setGameKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col items-center gap-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="font-pixel text-5xl text-primary neon-text mb-2">
              🐍 SNAKE
            </h1>
            <p className="text-muted-foreground">
              Classic arcade game reimagined
            </p>
          </div>

          {!isPlaying ? (
            // Menu screen
            <div className="flex flex-col items-center gap-8 animate-fade-in">
              {/* Mode selector */}
              <div className="space-y-4">
                <p className="font-pixel text-center text-muted-foreground">SELECT MODE</p>
                <ModeSelector
                  selectedMode={gameMode}
                  onModeChange={setGameMode}
                />
              </div>

              {/* Last score */}
              {lastScore !== null && (
                <div className="arcade-panel text-center">
                  <p className="font-pixel text-muted-foreground">LAST SCORE</p>
                  <p className="font-pixel text-4xl text-primary neon-text mt-2">{lastScore}</p>
                </div>
              )}

              {/* Start button */}
              <Button
                onClick={startGame}
                size="lg"
                className="font-pixel text-xl px-12 py-8 bg-primary text-primary-foreground hover:bg-primary/90 neon-border gap-3"
              >
                <Play className="w-6 h-6" />
                START GAME
              </Button>

              {/* Auth prompt */}
              {!user && (
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  <a href="/auth" className="text-primary hover:underline">Log in</a> to save your scores and appear on the leaderboard!
                </p>
              )}
            </div>
          ) : (
            // Game screen
            <div className="flex flex-col items-center gap-6 animate-scale-in">
              <GameBoard
                key={gameKey}
                mode={gameMode}
                onGameOver={handleGameOver}
              />
              
              <Button
                onClick={() => setIsPlaying(false)}
                variant="outline"
                className="font-pixel gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                BACK TO MENU
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
