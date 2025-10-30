import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { PenSquare, LogIn, LogOut } from 'lucide-react';

const Blogs = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            Welcome to the Blog Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Create and share your own blog with the world.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {user ? (
              <>
                <Link to="/admin">
                  <Button variant="default" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                    <PenSquare className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Button>
                </Link>
                <Button onClick={handleSignOut} variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                  <LogIn className="mr-2 h-5 w-5" />
                  Admin Login
                </Button>
              </Link>
            )}
          </div>
        </header>
      </div>
    </div>
  );
};

export default Blogs;