import { useEffect, useState } from 'react';
import { leaderboardApi, LeaderboardEntry } from '@/services/mockApi';
import { cn } from '@/lib/utils';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardTableProps {
  filterMode?: 'walls' | 'pass-through';
}

export function LeaderboardTable({ filterMode }: LeaderboardTableProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const data = await leaderboardApi.getLeaderboard(filterMode);
      setEntries(data);
      setLoading(false);
    };
    fetchLeaderboard();
  }, [filterMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="font-pixel text-primary animate-blink">LOADING...</div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="font-pixel text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="arcade-panel overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="font-pixel text-sm text-muted-foreground p-3 text-left w-16">RANK</th>
            <th className="font-pixel text-sm text-muted-foreground p-3 text-left">PLAYER</th>
            <th className="font-pixel text-sm text-muted-foreground p-3 text-right">SCORE</th>
            <th className="font-pixel text-sm text-muted-foreground p-3 text-center">MODE</th>
            <th className="font-pixel text-sm text-muted-foreground p-3 text-right">DATE</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={entry.id}
              className={cn(
                'border-b border-border/50 transition-colors hover:bg-muted/30',
                index < 3 && 'bg-primary/5'
              )}
            >
              <td className="p-3">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(index + 1)}
                </div>
              </td>
              <td className="p-3">
                <span className={cn(
                  'font-pixel',
                  index === 0 && 'text-yellow-400',
                  index === 1 && 'text-gray-300',
                  index === 2 && 'text-amber-600',
                  index > 2 && 'text-foreground'
                )}>
                  {entry.username}
                </span>
              </td>
              <td className="p-3 text-right">
                <span className="font-pixel text-primary neon-text">{entry.score}</span>
              </td>
              <td className="p-3 text-center">
                <span className={cn(
                  'font-pixel text-xs px-2 py-1 rounded',
                  entry.mode === 'walls'
                    ? 'bg-secondary/20 text-secondary'
                    : 'bg-accent/20 text-accent'
                )}>
                  {entry.mode.toUpperCase()}
                </span>
              </td>
              <td className="p-3 text-right">
                <span className="text-sm text-muted-foreground">{entry.date}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
