// Core game logic - pure functions for testability

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'walls' | 'pass-through';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  mode: GameMode;
  gridSize: number;
}

export const GRID_SIZE = 20;
export const INITIAL_SNAKE_LENGTH = 3;

export function createInitialState(mode: GameMode): GameState {
  const centerX = Math.floor(GRID_SIZE / 2);
  const centerY = Math.floor(GRID_SIZE / 2);
  
  const snake: Position[] = Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({
    x: centerX - i,
    y: centerY,
  }));

  return {
    snake,
    food: generateFood(snake),
    direction: 'RIGHT',
    score: 0,
    isGameOver: false,
    isPaused: false,
    mode,
    gridSize: GRID_SIZE,
  };
}

export function generateFood(snake: Position[]): Position {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
}

export function getNextHeadPosition(head: Position, direction: Direction, gridSize: number, mode: GameMode): Position {
  let newHead: Position;
  
  switch (direction) {
    case 'UP':
      newHead = { x: head.x, y: head.y - 1 };
      break;
    case 'DOWN':
      newHead = { x: head.x, y: head.y + 1 };
      break;
    case 'LEFT':
      newHead = { x: head.x - 1, y: head.y };
      break;
    case 'RIGHT':
      newHead = { x: head.x + 1, y: head.y };
      break;
  }

  // Handle pass-through mode (wrap around)
  if (mode === 'pass-through') {
    if (newHead.x < 0) newHead.x = gridSize - 1;
    if (newHead.x >= gridSize) newHead.x = 0;
    if (newHead.y < 0) newHead.y = gridSize - 1;
    if (newHead.y >= gridSize) newHead.y = 0;
  }

  return newHead;
}

export function checkWallCollision(position: Position, gridSize: number): boolean {
  return position.x < 0 || position.x >= gridSize || position.y < 0 || position.y >= gridSize;
}

export function checkSelfCollision(head: Position, body: Position[]): boolean {
  return body.some(segment => segment.x === head.x && segment.y === head.y);
}

export function checkFoodCollision(head: Position, food: Position): boolean {
  return head.x === food.x && head.y === food.y;
}

export function isOppositeDirection(dir1: Direction, dir2: Direction): boolean {
  return (
    (dir1 === 'UP' && dir2 === 'DOWN') ||
    (dir1 === 'DOWN' && dir2 === 'UP') ||
    (dir1 === 'LEFT' && dir2 === 'RIGHT') ||
    (dir1 === 'RIGHT' && dir2 === 'LEFT')
  );
}

export function moveSnake(state: GameState): GameState {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const head = state.snake[0];
  const newHead = getNextHeadPosition(head, state.direction, state.gridSize, state.mode);

  // Check wall collision (only in walls mode)
  if (state.mode === 'walls' && checkWallCollision(newHead, state.gridSize)) {
    return { ...state, isGameOver: true };
  }

  // Check self collision (excluding tail which will move)
  const bodyWithoutTail = state.snake.slice(0, -1);
  if (checkSelfCollision(newHead, bodyWithoutTail)) {
    return { ...state, isGameOver: true };
  }

  // Check food collision
  const ateFood = checkFoodCollision(newHead, state.food);
  
  const newSnake = [newHead, ...state.snake];
  if (!ateFood) {
    newSnake.pop(); // Remove tail if didn't eat
  }

  return {
    ...state,
    snake: newSnake,
    food: ateFood ? generateFood(newSnake) : state.food,
    score: ateFood ? state.score + 10 : state.score,
  };
}

export function changeDirection(state: GameState, newDirection: Direction): GameState {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  // Prevent reversing direction
  if (isOppositeDirection(state.direction, newDirection)) {
    return state;
  }

  return { ...state, direction: newDirection };
}

export function togglePause(state: GameState): GameState {
  if (state.isGameOver) {
    return state;
  }
  return { ...state, isPaused: !state.isPaused };
}
