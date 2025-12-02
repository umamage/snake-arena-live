import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Home, Frown } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Frown className="w-24 h-24 text-muted-foreground mb-6" />
          
          <h1 className="font-pixel text-6xl text-primary neon-text mb-4">
            404
          </h1>
          
          <p className="font-pixel text-2xl text-foreground mb-2">
            GAME NOT FOUND
          </p>
          
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Link to="/">
            <Button className="font-pixel gap-2">
              <Home className="w-4 h-4" />
              RETURN HOME
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
