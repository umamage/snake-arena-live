import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi, leaderboardApi, playersApi } from './mockApi';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('authApi', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('returns user on successful login', async () => {
      const result = await authApi.login('player1@test.com', 'password123');
      
      expect(result).toHaveProperty('user');
      if ('user' in result) {
        expect(result.user.username).toBe('SnakeMaster');
        expect(result.user.email).toBe('player1@test.com');
      }
    });

    it('returns error for non-existent user', async () => {
      const result = await authApi.login('nonexistent@test.com', 'password123');
      
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toBe('User not found');
      }
    });

    it('returns error for wrong password', async () => {
      const result = await authApi.login('player1@test.com', 'wrongpassword');
      
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toBe('Invalid password');
      }
    });

    it('saves user to localStorage on success', async () => {
      await authApi.login('player1@test.com', 'password123');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'snake_user',
        expect.any(String)
      );
    });
  });

  describe('signup', () => {
    it('creates new user successfully', async () => {
      const result = await authApi.signup('newuser@test.com', 'NewPlayer', 'password123');
      
      expect(result).toHaveProperty('user');
      if ('user' in result) {
        expect(result.user.username).toBe('NewPlayer');
        expect(result.user.email).toBe('newuser@test.com');
        expect(result.user.highScore).toBe(0);
      }
    });

    it('returns error for existing email', async () => {
      const result = await authApi.signup('player1@test.com', 'SomeUsername', 'password123');
      
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toBe('Email already registered');
      }
    });

    it('returns error for existing username', async () => {
      const result = await authApi.signup('unique@test.com', 'SnakeMaster', 'password123');
      
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toBe('Username already taken');
      }
    });
  });

  describe('logout', () => {
    it('removes user from localStorage', async () => {
      await authApi.login('player1@test.com', 'password123');
      await authApi.logout();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('snake_user');
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when no user logged in', async () => {
      const result = await authApi.getCurrentUser();
      expect(result).toBeNull();
    });

    it('returns user from localStorage', async () => {
      const mockUser = { id: '1', username: 'Test', email: 'test@test.com', highScore: 100 };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockUser));
      
      const result = await authApi.getCurrentUser();
      expect(result).toEqual(mockUser);
    });
  });
});

describe('leaderboardApi', () => {
  describe('getLeaderboard', () => {
    it('returns all entries without filter', async () => {
      const entries = await leaderboardApi.getLeaderboard();
      
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0]).toHaveProperty('id');
      expect(entries[0]).toHaveProperty('username');
      expect(entries[0]).toHaveProperty('score');
      expect(entries[0]).toHaveProperty('mode');
    });

    it('filters by walls mode', async () => {
      const entries = await leaderboardApi.getLeaderboard('walls');
      
      expect(entries.every(e => e.mode === 'walls')).toBe(true);
    });

    it('filters by pass-through mode', async () => {
      const entries = await leaderboardApi.getLeaderboard('pass-through');
      
      expect(entries.every(e => e.mode === 'pass-through')).toBe(true);
    });
  });

  describe('submitScore', () => {
    it('returns success false when not logged in', async () => {
      await authApi.logout();
      const result = await leaderboardApi.submitScore(100, 'walls');
      
      expect(result.success).toBe(false);
    });

    it('returns success and rank when logged in', async () => {
      await authApi.login('player1@test.com', 'password123');
      const result = await leaderboardApi.submitScore(5000, 'walls');
      
      expect(result.success).toBe(true);
      expect(result.rank).toBeDefined();
      expect(typeof result.rank).toBe('number');
    });
  });
});

describe('playersApi', () => {
  describe('getActivePlayers', () => {
    it('returns list of active players', async () => {
      const players = await playersApi.getActivePlayers();
      
      expect(players.length).toBeGreaterThan(0);
      expect(players[0]).toHaveProperty('id');
      expect(players[0]).toHaveProperty('username');
      expect(players[0]).toHaveProperty('score');
      expect(players[0]).toHaveProperty('mode');
    });
  });

  describe('getPlayerGameState', () => {
    it('returns null for non-existent player', async () => {
      const state = await playersApi.getPlayerGameState('nonexistent');
      expect(state).toBeNull();
    });

    it('returns game state for existing player', async () => {
      const players = await playersApi.getActivePlayers();
      const state = await playersApi.getPlayerGameState(players[0].id);
      
      expect(state).not.toBeNull();
      expect(state).toHaveProperty('snake');
      expect(state).toHaveProperty('food');
      expect(state).toHaveProperty('direction');
      expect(state).toHaveProperty('score');
    });
  });
});
