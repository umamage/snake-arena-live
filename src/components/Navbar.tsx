import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Gamepad2, Trophy, Eye, LogIn, LogOut, User } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'PLAY', icon: Gamepad2 },
    { path: '/leaderboard', label: 'RANKS', icon: Trophy },
    { path: '/watch', label: 'WATCH', icon: Eye },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-pixel text-2xl text-primary neon-text group-hover:animate-pulse-glow transition-all">
              🐍 SNAKE
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant="ghost"
                  className={cn(
                    'font-pixel text-sm gap-2 transition-all',
                    location.pathname === path
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-pixel text-sm text-foreground">{user.username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="font-pixel text-sm text-muted-foreground hover:text-destructive gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  EXIT
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-pixel text-sm gap-2 border-primary/50 text-primary hover:bg-primary/10"
                >
                  <LogIn className="w-4 h-4" />
                  LOGIN
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
