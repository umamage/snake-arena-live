import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ModeSelector } from './ModeSelector';

describe('ModeSelector', () => {
  it('renders both mode options', () => {
    const onModeChange = vi.fn();
    const { container } = render(<ModeSelector selectedMode="walls" onModeChange={onModeChange} />);
    
    expect(container.textContent).toContain('WALLS');
    expect(container.textContent).toContain('PASS-THROUGH');
  });

  it('displays walls mode description', () => {
    const onModeChange = vi.fn();
    const { container } = render(<ModeSelector selectedMode="walls" onModeChange={onModeChange} />);
    
    expect(container.textContent).toContain('Hit walls = Game Over');
  });

  it('displays pass-through mode description', () => {
    const onModeChange = vi.fn();
    const { container } = render(<ModeSelector selectedMode="walls" onModeChange={onModeChange} />);
    
    expect(container.textContent).toContain('Wrap around edges');
  });

  it('calls onModeChange when walls is clicked', () => {
    const onModeChange = vi.fn();
    const { container } = render(<ModeSelector selectedMode="pass-through" onModeChange={onModeChange} />);
    
    const wallsButton = container.querySelector('button:first-child');
    wallsButton?.click();
    
    expect(onModeChange).toHaveBeenCalledWith('walls');
  });

  it('calls onModeChange when pass-through is clicked', () => {
    const onModeChange = vi.fn();
    const { container } = render(<ModeSelector selectedMode="walls" onModeChange={onModeChange} />);
    
    const passThroughButton = container.querySelector('button:last-child');
    passThroughButton?.click();
    
    expect(onModeChange).toHaveBeenCalledWith('pass-through');
  });

  it('highlights selected mode (walls)', () => {
    const onModeChange = vi.fn();
    const { container } = render(<ModeSelector selectedMode="walls" onModeChange={onModeChange} />);
    
    const wallsButton = container.querySelector('button:first-child');
    expect(wallsButton?.className).toContain('border-secondary');
  });

  it('highlights selected mode (pass-through)', () => {
    const onModeChange = vi.fn();
    const { container } = render(<ModeSelector selectedMode="pass-through" onModeChange={onModeChange} />);
    
    const passThroughButton = container.querySelector('button:last-child');
    expect(passThroughButton?.className).toContain('border-accent');
  });
});
