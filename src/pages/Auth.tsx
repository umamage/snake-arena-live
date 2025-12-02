import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { AuthForms } from '@/components/AuthForms';
import { useAuth } from '@/contexts/AuthContext';
import { Gamepad2 } from 'lucide-react';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-md mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gamepad2 className="w-12 h-12 text-primary animate-pulse-glow" />
            </div>
            <h1 className="font-pixel text-3xl text-foreground mb-2">
              JOIN THE GAME
            </h1>
            <p className="text-muted-foreground">
              Log in to save scores and compete on the leaderboard
            </p>
          </div>

          {/* Auth forms */}
          <div className="arcade-panel">
            <AuthForms onSuccess={() => navigate('/')} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
