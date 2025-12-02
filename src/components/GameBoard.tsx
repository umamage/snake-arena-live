import React, { useEffect, useRef, useCallback, useState } from 'react';
import { GameState, Direction, createInitialState, moveSnake, changeDirection, togglePause, GRID_SIZE } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  mode: 'walls' | 'pass-through';
  onGameOver?: (score: number) => void;
  isSpectator?: boolean;
  spectatorState?: GameState | null;
}

const CELL_SIZE = 20;
const GAME_SPEED = 120;

export function GameBoard({ mode, onGameOver, isSpectator = false, spectatorState }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(mode));
  const gameLoopRef = useRef<number | null>(null);
  const directionQueueRef = useRef<Direction[]>([]);

  const state = isSpectator && spectatorState ? spectatorState : gameState;

  const resetGame = useCallback(() => {
    setGameState(createInitialState(mode));
    directionQueueRef.current = [];
  }, [mode]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isSpectator) return;

    const keyDirectionMap: Record<string, Direction> = {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      w: 'UP',
      W: 'UP',
      s: 'DOWN',
      S: 'DOWN',
      a: 'LEFT',
      A: 'LEFT',
      d: 'RIGHT',
      D: 'RIGHT',
    };

    if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      setGameState(prev => togglePause(prev));
      return;
    }

    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      resetGame();
      return;
    }

    const newDirection = keyDirectionMap[e.key];
    if (newDirection) {
      e.preventDefault();
      directionQueueRef.current.push(newDirection);
    }
  }, [isSpectator, resetGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isSpectator) return;

    const gameLoop = () => {
      setGameState(prev => {
        if (prev.isGameOver || prev.isPaused) return prev;

        // Process direction queue
        let newState = prev;
        while (directionQueueRef.current.length > 0) {
          const nextDirection = directionQueueRef.current.shift()!;
          newState = changeDirection(newState, nextDirection);
        }

        return moveSnake(newState);
      });
    };

    gameLoopRef.current = window.setInterval(gameLoop, GAME_SPEED);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isSpectator]);

  useEffect(() => {
    if (gameState.isGameOver && onGameOver) {
      onGameOver(gameState.score);
    }
  }, [gameState.isGameOver, gameState.score, onGameOver]);

  const renderCell = (x: number, y: number) => {
    const isSnakeHead = state.snake[0]?.x === x && state.snake[0]?.y === y;
    const isSnakeBody = state.snake.slice(1).some(s => s.x === x && s.y === y);
    const isFood = state.food.x === x && state.food.y === y;

    return (
      <div
        key={`${x}-${y}`}
        className={cn(
          'transition-all duration-75',
          isSnakeHead && 'bg-primary rounded-sm animate-snake-move',
          isSnakeBody && 'bg-primary/80 rounded-sm',
          isFood && 'bg-food rounded-full animate-pulse-glow',
          (isSnakeHead || isSnakeBody) && 'shadow-[0_0_10px_hsl(var(--snake))]',
          isFood && 'shadow-[0_0_15px_hsl(var(--food))]'
        )}
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
        }}
      />
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score display */}
      <div className="flex items-center gap-8 font-pixel text-2xl">
        <span className="text-muted-foreground">SCORE:</span>
        <span className="text-primary neon-text">{state.score}</span>
        <span className="text-muted-foreground">MODE:</span>
        <span className={cn(
          mode === 'walls' ? 'text-secondary neon-text-secondary' : 'text-accent neon-text-accent'
        )}>
          {mode.toUpperCase()}
        </span>
      </div>

      {/* Game board */}
      <div
        className={cn(
          'relative game-grid border-2 rounded-lg overflow-hidden',
          mode === 'walls' ? 'border-secondary/50' : 'border-accent/50',
          mode === 'walls' ? 'neon-border-secondary' : 'shadow-[0_0_20px_hsl(180_100%_50%/0.3)]'
        )}
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            return renderCell(x, y);
          })}
        </div>

        {/* Overlay for paused/game over */}
        {(state.isPaused || state.isGameOver) && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-4 animate-fade-in">
            <span className="font-pixel text-3xl text-primary neon-text">
              {state.isGameOver ? 'GAME OVER' : 'PAUSED'}
            </span>
            {state.isGameOver && (
              <span className="font-pixel text-xl text-muted-foreground">
                Final Score: {state.score}
              </span>
            )}
            {!isSpectator && (
              <span className="font-pixel text-sm text-muted-foreground">
                {state.isGameOver ? 'Press R to restart' : 'Press SPACE to resume'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Controls info */}
      {!isSpectator && (
        <div className="font-pixel text-sm text-muted-foreground text-center">
          <p>WASD or Arrow Keys to move</p>
          <p>SPACE to pause • R to restart</p>
        </div>
      )}
    </div>
  );
}
