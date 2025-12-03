// Centralized mock API service - all backend calls go through here
// This makes it easy to replace with real backend later

export interface User {
  id: string;
  username: string;
  email: string;
  highScore: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  mode: 'walls' | 'pass-through';
  date: string;
}

export interface ActivePlayer {
  id: string;
  username: string;
  score: number;
  mode: 'walls' | 'pass-through';
  startedAt: string;
}

// Simulated delay to mimic network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage (in-memory)
let currentUser: User | null = null;
const users: Map<string, User & { password: string }> = new Map();

// Initialize with some mock users
users.set('player1@test.com', {
  id: '1',
  username: 'SnakeMaster',
  email: 'player1@test.com',
  password: 'password123',
  highScore: 2450,
  createdAt: '2024-01-15T10:30:00Z',
});

users.set('player2@test.com', {
  id: '2',
  username: 'RetroGamer',
  email: 'player2@test.com',
  password: 'password123',
  highScore: 1890,
  createdAt: '2024-02-20T14:45:00Z',
});

// Mock leaderboard data
const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'SnakeMaster', score: 2450, mode: 'walls', date: '2024-11-28' },
  { id: '2', username: 'RetroGamer', score: 1890, mode: 'pass-through', date: '2024-11-27' },
  { id: '3', username: 'ArcadeKing', score: 1750, mode: 'walls', date: '2024-11-26' },
  { id: '4', username: 'PixelPro', score: 1620, mode: 'pass-through', date: '2024-11-25' },
  { id: '5', username: 'NeonNinja', score: 1480, mode: 'walls', date: '2024-11-24' },
  { id: '6', username: 'ByteBoss', score: 1350, mode: 'pass-through', date: '2024-11-23' },
  { id: '7', username: 'GridGuru', score: 1200, mode: 'walls', date: '2024-11-22' },
  { id: '8', username: 'VectorViper', score: 1050, mode: 'pass-through', date: '2024-11-21' },
  { id: '9', username: 'DigitalDragon', score: 980, mode: 'walls', date: '2024-11-20' },
  { id: '10', username: 'CyberSnake', score: 850, mode: 'pass-through', date: '2024-11-19' },
];

// Mock active players
const mockActivePlayers: ActivePlayer[] = [
  { id: 'ap1', username: 'LivePlayer1', score: 340, mode: 'walls', startedAt: new Date().toISOString() },
  { id: 'ap2', username: 'LivePlayer2', score: 520, mode: 'pass-through', startedAt: new Date().toISOString() },
  { id: 'ap3', username: 'LivePlayer3', score: 180, mode: 'walls', startedAt: new Date().toISOString() },
];

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<{ user: User } | { error: string }> {
    await delay(500);
    
    const user = users.get(email);
    if (!user) {
      return { error: 'User not found' };
    }
    if (user.password !== password) {
      return { error: 'Invalid password' };
    }
    
    const { password: _, ...userWithoutPassword } = user;
    currentUser = userWithoutPassword;
    localStorage.setItem('snake_user', JSON.stringify(userWithoutPassword));
    return { user: userWithoutPassword };
  },

  async signup(email: string, username: string, password: string): Promise<{ user: User } | { error: string }> {
    await delay(500);
    
    if (users.has(email)) {
      return { error: 'Email already registered' };
    }
    
    const existingUsername = Array.from(users.values()).find(u => u.username === username);
    if (existingUsername) {
      return { error: 'Username already taken' };
    }
    
    const newUser: User & { password: string } = {
      id: crypto.randomUUID(),
      username,
      email,
      password,
      highScore: 0,
      createdAt: new Date().toISOString(),
    };
    
    users.set(email, newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    currentUser = userWithoutPassword;
    localStorage.setItem('snake_user', JSON.stringify(userWithoutPassword));
    return { user: userWithoutPassword };
  },

  async logout(): Promise<void> {
    await delay(200);
    currentUser = null;
    localStorage.removeItem('snake_user');
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    const stored = localStorage.getItem('snake_user');
    if (stored) {
      currentUser = JSON.parse(stored);
      return currentUser;
    }
    return null;
  },
};

// Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(mode?: 'walls' | 'pass-through'): Promise<LeaderboardEntry[]> {
    await delay(300);
    if (mode) {
      return mockLeaderboard.filter(entry => entry.mode === mode);
    }
    return mockLeaderboard;
  },

  async submitScore(score: number, mode: 'walls' | 'pass-through'): Promise<{ success: boolean; rank?: number }> {
    await delay(400);
    
    if (!currentUser) {
      return { success: false };
    }
    
    const newEntry: LeaderboardEntry = {
      id: crypto.randomUUID(),
      username: currentUser.username,
      score,
      mode,
      date: new Date().toISOString().split('T')[0],
    };
    
    mockLeaderboard.push(newEntry);
    mockLeaderboard.sort((a, b) => b.score - a.score);
    
    const rank = mockLeaderboard.findIndex(e => e.id === newEntry.id) + 1;
    
    // Update user's high score
    if (score > currentUser.highScore) {
      currentUser.highScore = score;
      localStorage.setItem('snake_user', JSON.stringify(currentUser));
    }
    
    return { success: true, rank };
  },
};

// Active players API (for spectator mode)
export const playersApi = {
  async getActivePlayers(): Promise<ActivePlayer[]> {
    await delay(200);
    // Simulate score updates
    return mockActivePlayers.map(player => ({
      ...player,
      score: player.score + Math.floor(Math.random() * 50),
    }));
  },

  async getPlayerGameState(playerId: string): Promise<{ 
    snake: { x: number; y: number }[];
    food: { x: number; y: number };
    direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
    score: number;
  } | null> {
    await delay(100);
    
    const player = mockActivePlayers.find(p => p.id === playerId);
    if (!player) return null;
    
    // Generate mock game state
    const snakeLength = Math.floor(player.score / 10) + 3;
    const snake = Array.from({ length: snakeLength }, (_, i) => ({
      x: 10 - i,
      y: 10,
    }));
    
    return {
      snake,
      food: { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) },
      direction: ['UP', 'DOWN', 'LEFT', 'RIGHT'][Math.floor(Math.random() * 4)] as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT',
      score: player.score,
    };
  },
};
