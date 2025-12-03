import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  getNextHeadPosition,
  checkWallCollision,
  checkSelfCollision,
  checkFoodCollision,
  isOppositeDirection,
  moveSnake,
  changeDirection,
  togglePause,
  GRID_SIZE,
  INITIAL_SNAKE_LENGTH,
  GameState,
  Position,
} from './gameLogic';

describe('createInitialState', () => {
  it('creates a valid initial state for walls mode', () => {
    const state = createInitialState('walls');
    
    expect(state.mode).toBe('walls');
    expect(state.snake).toHaveLength(INITIAL_SNAKE_LENGTH);
    expect(state.direction).toBe('RIGHT');
    expect(state.score).toBe(0);
    expect(state.isGameOver).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(state.gridSize).toBe(GRID_SIZE);
  });

  it('creates a valid initial state for pass-through mode', () => {
    const state = createInitialState('pass-through');
    
    expect(state.mode).toBe('pass-through');
    expect(state.snake).toHaveLength(INITIAL_SNAKE_LENGTH);
  });

  it('creates snake in horizontal line', () => {
    const state = createInitialState('walls');
    const snake = state.snake;
    
    // All segments should have same y coordinate
    const y = snake[0].y;
    expect(snake.every(s => s.y === y)).toBe(true);
    
    // Each segment should be 1 position to the left
    for (let i = 1; i < snake.length; i++) {
      expect(snake[i].x).toBe(snake[i - 1].x - 1);
    }
  });

  it('places food not on snake', () => {
    const state = createInitialState('walls');
    const foodOnSnake = state.snake.some(
      s => s.x === state.food.x && s.y === state.food.y
    );
    expect(foodOnSnake).toBe(false);
  });
});

describe('getNextHeadPosition', () => {
  const head: Position = { x: 10, y: 10 };

  it('moves up correctly', () => {
    const newHead = getNextHeadPosition(head, 'UP', GRID_SIZE, 'walls');
    expect(newHead).toEqual({ x: 10, y: 9 });
  });

  it('moves down correctly', () => {
    const newHead = getNextHeadPosition(head, 'DOWN', GRID_SIZE, 'walls');
    expect(newHead).toEqual({ x: 10, y: 11 });
  });

  it('moves left correctly', () => {
    const newHead = getNextHeadPosition(head, 'LEFT', GRID_SIZE, 'walls');
    expect(newHead).toEqual({ x: 9, y: 10 });
  });

  it('moves right correctly', () => {
    const newHead = getNextHeadPosition(head, 'RIGHT', GRID_SIZE, 'walls');
    expect(newHead).toEqual({ x: 11, y: 10 });
  });

  describe('pass-through mode wrapping', () => {
    it('wraps from top to bottom', () => {
      const topHead: Position = { x: 10, y: 0 };
      const newHead = getNextHeadPosition(topHead, 'UP', GRID_SIZE, 'pass-through');
      expect(newHead).toEqual({ x: 10, y: GRID_SIZE - 1 });
    });

    it('wraps from bottom to top', () => {
      const bottomHead: Position = { x: 10, y: GRID_SIZE - 1 };
      const newHead = getNextHeadPosition(bottomHead, 'DOWN', GRID_SIZE, 'pass-through');
      expect(newHead).toEqual({ x: 10, y: 0 });
    });

    it('wraps from left to right', () => {
      const leftHead: Position = { x: 0, y: 10 };
      const newHead = getNextHeadPosition(leftHead, 'LEFT', GRID_SIZE, 'pass-through');
      expect(newHead).toEqual({ x: GRID_SIZE - 1, y: 10 });
    });

    it('wraps from right to left', () => {
      const rightHead: Position = { x: GRID_SIZE - 1, y: 10 };
      const newHead = getNextHeadPosition(rightHead, 'RIGHT', GRID_SIZE, 'pass-through');
      expect(newHead).toEqual({ x: 0, y: 10 });
    });
  });
});

describe('checkWallCollision', () => {
  it('detects collision with left wall', () => {
    expect(checkWallCollision({ x: -1, y: 10 }, GRID_SIZE)).toBe(true);
  });

  it('detects collision with right wall', () => {
    expect(checkWallCollision({ x: GRID_SIZE, y: 10 }, GRID_SIZE)).toBe(true);
  });

  it('detects collision with top wall', () => {
    expect(checkWallCollision({ x: 10, y: -1 }, GRID_SIZE)).toBe(true);
  });

  it('detects collision with bottom wall', () => {
    expect(checkWallCollision({ x: 10, y: GRID_SIZE }, GRID_SIZE)).toBe(true);
  });

  it('returns false for valid position', () => {
    expect(checkWallCollision({ x: 10, y: 10 }, GRID_SIZE)).toBe(false);
  });

  it('returns false for edge positions', () => {
    expect(checkWallCollision({ x: 0, y: 0 }, GRID_SIZE)).toBe(false);
    expect(checkWallCollision({ x: GRID_SIZE - 1, y: GRID_SIZE - 1 }, GRID_SIZE)).toBe(false);
  });
});

describe('checkSelfCollision', () => {
  it('detects collision with body', () => {
    const head: Position = { x: 5, y: 5 };
    const body: Position[] = [{ x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }];
    expect(checkSelfCollision(head, body)).toBe(true);
  });

  it('returns false when no collision', () => {
    const head: Position = { x: 5, y: 5 };
    const body: Position[] = [{ x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 }];
    expect(checkSelfCollision(head, body)).toBe(false);
  });
});

describe('checkFoodCollision', () => {
  it('detects when head is on food', () => {
    const head: Position = { x: 5, y: 5 };
    const food: Position = { x: 5, y: 5 };
    expect(checkFoodCollision(head, food)).toBe(true);
  });

  it('returns false when head is not on food', () => {
    const head: Position = { x: 5, y: 5 };
    const food: Position = { x: 10, y: 10 };
    expect(checkFoodCollision(head, food)).toBe(false);
  });
});

describe('isOppositeDirection', () => {
  it('UP and DOWN are opposite', () => {
    expect(isOppositeDirection('UP', 'DOWN')).toBe(true);
    expect(isOppositeDirection('DOWN', 'UP')).toBe(true);
  });

  it('LEFT and RIGHT are opposite', () => {
    expect(isOppositeDirection('LEFT', 'RIGHT')).toBe(true);
    expect(isOppositeDirection('RIGHT', 'LEFT')).toBe(true);
  });

  it('perpendicular directions are not opposite', () => {
    expect(isOppositeDirection('UP', 'LEFT')).toBe(false);
    expect(isOppositeDirection('UP', 'RIGHT')).toBe(false);
    expect(isOppositeDirection('DOWN', 'LEFT')).toBe(false);
    expect(isOppositeDirection('DOWN', 'RIGHT')).toBe(false);
  });
});

describe('moveSnake', () => {
  it('moves snake forward', () => {
    const state = createInitialState('walls');
    const newState = moveSnake(state);
    
    expect(newState.snake[0].x).toBe(state.snake[0].x + 1);
    expect(newState.snake[0].y).toBe(state.snake[0].y);
  });

  it('does not move when paused', () => {
    const state = { ...createInitialState('walls'), isPaused: true };
    const newState = moveSnake(state);
    
    expect(newState.snake).toEqual(state.snake);
  });

  it('does not move when game over', () => {
    const state = { ...createInitialState('walls'), isGameOver: true };
    const newState = moveSnake(state);
    
    expect(newState.snake).toEqual(state.snake);
  });

  it('increases score when eating food', () => {
    const state = createInitialState('walls');
    const head = state.snake[0];
    const stateWithFood: GameState = {
      ...state,
      food: { x: head.x + 1, y: head.y },
    };
    
    const newState = moveSnake(stateWithFood);
    expect(newState.score).toBe(10);
  });

  it('grows snake when eating food', () => {
    const state = createInitialState('walls');
    const head = state.snake[0];
    const stateWithFood: GameState = {
      ...state,
      food: { x: head.x + 1, y: head.y },
    };
    
    const newState = moveSnake(stateWithFood);
    expect(newState.snake.length).toBe(state.snake.length + 1);
  });

  it('ends game on wall collision in walls mode', () => {
    const state: GameState = {
      ...createInitialState('walls'),
      snake: [{ x: GRID_SIZE - 1, y: 10 }, { x: GRID_SIZE - 2, y: 10 }],
      direction: 'RIGHT',
    };
    
    const newState = moveSnake(state);
    expect(newState.isGameOver).toBe(true);
  });

  it('wraps around in pass-through mode', () => {
    const state: GameState = {
      ...createInitialState('pass-through'),
      snake: [{ x: GRID_SIZE - 1, y: 10 }, { x: GRID_SIZE - 2, y: 10 }],
      direction: 'RIGHT',
    };
    
    const newState = moveSnake(state);
    expect(newState.isGameOver).toBe(false);
    expect(newState.snake[0].x).toBe(0);
  });

  it('ends game on self collision', () => {
    const state: GameState = {
      ...createInitialState('walls'),
      snake: [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 6, y: 6 },
        { x: 6, y: 5 },
        { x: 6, y: 4 },
      ],
      direction: 'DOWN',
    };
    
    const newState = moveSnake(state);
    expect(newState.isGameOver).toBe(true);
  });
});

describe('changeDirection', () => {
  it('changes direction', () => {
    const state = createInitialState('walls');
    const newState = changeDirection(state, 'UP');
    expect(newState.direction).toBe('UP');
  });

  it('does not allow reversing direction', () => {
    const state = { ...createInitialState('walls'), direction: 'RIGHT' as const };
    const newState = changeDirection(state, 'LEFT');
    expect(newState.direction).toBe('RIGHT');
  });

  it('does not change direction when paused', () => {
    const state = { ...createInitialState('walls'), isPaused: true };
    const newState = changeDirection(state, 'UP');
    expect(newState.direction).toBe('RIGHT');
  });

  it('does not change direction when game over', () => {
    const state = { ...createInitialState('walls'), isGameOver: true };
    const newState = changeDirection(state, 'UP');
    expect(newState.direction).toBe('RIGHT');
  });
});

describe('togglePause', () => {
  it('pauses the game', () => {
    const state = createInitialState('walls');
    const newState = togglePause(state);
    expect(newState.isPaused).toBe(true);
  });

  it('unpauses the game', () => {
    const state = { ...createInitialState('walls'), isPaused: true };
    const newState = togglePause(state);
    expect(newState.isPaused).toBe(false);
  });

  it('does not toggle when game over', () => {
    const state = { ...createInitialState('walls'), isGameOver: true, isPaused: false };
    const newState = togglePause(state);
    expect(newState.isPaused).toBe(false);
  });
});
