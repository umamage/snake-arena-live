import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LeaderboardTable } from './LeaderboardTable';

describe('LeaderboardTable', () => {
  it('shows loading state initially', () => {
    const { container } = render(<LeaderboardTable />);
    expect(container.textContent).toContain('LOADING...');
  });

  it('renders table structure', () => {
    const { container } = render(<LeaderboardTable />);
    
    // Should have a table element
    const table = container.querySelector('table');
    expect(table).toBeTruthy();
  });

  it('accepts filterMode prop without errors', () => {
    // Should render without errors for walls mode
    const { container: wallsContainer } = render(<LeaderboardTable filterMode="walls" />);
    expect(wallsContainer).toBeTruthy();

    // Should render without errors for pass-through mode
    const { container: ptContainer } = render(<LeaderboardTable filterMode="pass-through" />);
    expect(ptContainer).toBeTruthy();
  });
});
