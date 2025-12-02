import { useEffect, useState, useCallback } from 'react';
import { playersApi, ActivePlayer } from '@/services/mockApi';
import { GameBoard } from './GameBoard';
import { GameState, createInitialState, moveSnake, changeDirection, Direction, GRID_SIZE } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';
import { Eye, Users, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SpectatorView() {
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayer | null>(null);
  const [spectatorState, setSpectatorState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch active players
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      const players = await playersApi.getActivePlayers();
      setActivePlayers(players);
      setLoading(false);
    };
    fetchPlayers();

    // Refresh player list every 5 seconds
    const interval = setInterval(fetchPlayers, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate AI playing when watching a player
  useEffect(() => {
    if (!selectedPlayer) return;

    // Initialize game state for spectator
    const initialState = createInitialState(selectedPlayer.mode);
    setSpectatorState(initialState);

    // AI player logic
    const gameLoop = setInterval(() => {
      setSpectatorState(prev => {
        if (!prev || prev.isGameOver) return prev;

        // Simple AI: move towards food
        const head = prev.snake[0];
        const food = prev.food;
        let newDirection: Direction = prev.direction;

        // Decide direction based on food position with some randomness
        if (Math.random() > 0.3) {
          if (food.x > head.x && prev.direction !== 'LEFT') {
            newDirection = 'RIGHT';
          } else if (food.x < head.x && prev.direction !== 'RIGHT') {
            newDirection = 'LEFT';
          } else if (food.y > head.y && prev.direction !== 'UP') {
            newDirection = 'DOWN';
          } else if (food.y < head.y && prev.direction !== 'DOWN') {
            newDirection = 'UP';
          }
        }

        // Avoid walls in walls mode
        if (prev.mode === 'walls') {
          const nextPos = getNextPosition(head, newDirection);
          if (nextPos.x < 0 || nextPos.x >= GRID_SIZE || nextPos.y < 0 || nextPos.y >= GRID_SIZE) {
            // Change to a safe direction
            const safeDirections: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'].filter(d => {
              const pos = getNextPosition(head, d as Direction);
              return pos.x >= 0 && pos.x < GRID_SIZE && pos.y >= 0 && pos.y < GRID_SIZE;
            }) as Direction[];
            if (safeDirections.length > 0) {
              newDirection = safeDirections[Math.floor(Math.random() * safeDirections.length)];
            }
          }
        }

        const stateWithNewDir = changeDirection(prev, newDirection);
        return moveSnake(stateWithNewDir);
      });
    }, 150);

    return () => clearInterval(gameLoop);
  }, [selectedPlayer]);

  const getNextPosition = (pos: { x: number; y: number }, dir: Direction) => {
    switch (dir) {
      case 'UP': return { x: pos.x, y: pos.y - 1 };
      case 'DOWN': return { x: pos.x, y: pos.y + 1 };
      case 'LEFT': return { x: pos.x - 1, y: pos.y };
      case 'RIGHT': return { x: pos.x + 1, y: pos.y };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="font-pixel text-primary animate-blink">LOADING LIVE GAMES...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Player list */}
      <div className="lg:w-72 space-y-4">
        <div className="flex items-center gap-2 font-pixel text-lg text-foreground">
          <Users className="w-5 h-5 text-primary" />
          LIVE PLAYERS
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary animate-pulse">
            {activePlayers.length}
          </span>
        </div>

        <div className="space-y-2">
          {activePlayers.map(player => (
            <button
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              className={cn(
                'w-full p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.02]',
                selectedPlayer?.id === player.id
                  ? 'border-primary bg-primary/10 neon-border'
                  : 'border-border hover:border-primary/50 bg-card'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-pixel text-foreground">{player.username}</span>
                {selectedPlayer?.id === player.id && (
                  <Eye className="w-4 h-4 text-primary animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-muted-foreground">
                  Score: <span className="text-primary">{player.score}</span>
                </span>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  player.mode === 'walls'
                    ? 'bg-secondary/20 text-secondary'
                    : 'bg-accent/20 text-accent'
                )}>
                  {player.mode}
                </span>
              </div>
            </button>
          ))}
        </div>

        {activePlayers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-pixel">No live games</p>
            <p className="text-sm mt-2">Check back later!</p>
          </div>
        )}
      </div>

      {/* Spectator game view */}
      <div className="flex-1">
        {selectedPlayer ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-primary animate-pulse" />
                <span className="font-pixel text-lg">
                  Watching: <span className="text-primary">{selectedPlayer.username}</span>
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPlayer(null)}
                className="font-pixel text-sm"
              >
                STOP WATCHING
              </Button>
            </div>
            
            <GameBoard
              mode={selectedPlayer.mode}
              isSpectator
              spectatorState={spectatorState}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 arcade-panel">
            <Play className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="font-pixel text-xl text-muted-foreground">SELECT A PLAYER</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click on a player from the list to watch their game
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
