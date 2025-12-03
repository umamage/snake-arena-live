import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Lock } from 'lucide-react';

interface AuthFormsProps {
  onSuccess?: () => void;
}

export function AuthForms({ onSuccess }: AuthFormsProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (mode === 'login') {
        result = await login(formData.email, formData.password);
      } else {
        result = await signup(formData.email, formData.username, formData.password);
      }

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: mode === 'login' ? 'Welcome back!' : 'Account created!',
          description: mode === 'login' ? 'You are now logged in.' : 'You can now play and save your scores.',
        });
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Mode tabs */}
      <div className="flex mb-8">
        <button
          onClick={() => setMode('login')}
          className={cn(
            'flex-1 font-pixel text-lg py-3 border-b-2 transition-all',
            mode === 'login'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          LOGIN
        </button>
        <button
          onClick={() => setMode('signup')}
          className={cn(
            'flex-1 font-pixel text-lg py-3 border-b-2 transition-all',
            mode === 'signup'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          SIGN UP
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-pixel text-sm text-muted-foreground">
            EMAIL
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="pl-10 font-sans bg-input border-border focus:border-primary"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        {mode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="username" className="font-pixel text-sm text-muted-foreground">
              USERNAME
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="pl-10 font-sans bg-input border-border focus:border-primary"
                placeholder="SnakeMaster99"
                required
                minLength={3}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password" className="font-pixel text-sm text-muted-foreground">
            PASSWORD
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="pl-10 font-sans bg-input border-border focus:border-primary"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full font-pixel text-lg py-6 bg-primary text-primary-foreground hover:bg-primary/90 neon-border"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            mode === 'login' ? 'ENTER GAME' : 'CREATE ACCOUNT'
          )}
        </Button>
      </form>

      {/* Demo credentials hint */}
      {mode === 'login' && (
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="font-pixel text-xs text-muted-foreground mb-2">DEMO ACCOUNT:</p>
          <p className="text-sm text-muted-foreground">
            Email: <span className="text-foreground">player1@test.com</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Password: <span className="text-foreground">password123</span>
          </p>
        </div>
      )}
    </div>
  );
}
