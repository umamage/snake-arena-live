import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { GameBoard } from './GameBoard';

// Mock the game loop interval
vi.useFakeTimers();

describe('GameBoard', () => {
  it('renders score display', () => {
    const { container } = render(<GameBoard mode="walls" />);
    expect(container.textContent).toContain('SCORE:');
  });

  it('displays mode correctly for walls', () => {
    const { container } = render(<GameBoard mode="walls" />);
    expect(container.textContent).toContain('WALLS');
  });

  it('displays mode correctly for pass-through', () => {
    const { container } = render(<GameBoard mode="pass-through" />);
    expect(container.textContent).toContain('PASS-THROUGH');
  });

  it('shows controls info when not spectator', () => {
    const { container } = render(<GameBoard mode="walls" isSpectator={false} />);
    expect(container.textContent).toContain('WASD or Arrow Keys');
  });

  it('hides controls info when spectator', () => {
    const { container } = render(<GameBoard mode="walls" isSpectator={true} />);
    expect(container.textContent).not.toContain('WASD or Arrow Keys');
  });

  it('starts with score of 0', () => {
    const { container } = render(<GameBoard mode="walls" />);
    expect(container.textContent).toContain('0');
  });
});
