import { Navbar } from '@/components/Navbar';
import { SpectatorView } from '@/components/SpectatorView';
import { Eye, Radio } from 'lucide-react';

const Watch = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Eye className="w-10 h-10 text-primary" />
              <h1 className="font-pixel text-4xl text-foreground">
                SPECTATOR MODE
              </h1>
              <Radio className="w-6 h-6 text-destructive animate-pulse" />
            </div>
            <p className="text-muted-foreground">
              Watch other players compete in real-time
            </p>
          </div>

          {/* Spectator view */}
          <SpectatorView />
        </div>
      </main>
    </div>
  );
};

export default Watch;
