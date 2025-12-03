import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeaderboardTable } from './LeaderboardTable';

describe('LeaderboardTable', () => {
  it('shows loading state initially', () => {
    const { container } = render(<LeaderboardTable />);
    expect(container.textContent).toContain('LOADING...');
  });

  it('renders table structure', async () => {
    render(<LeaderboardTable />);

    // Should have a table element (wait for loading to finish)
    const table = await screen.findByRole('table');
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
