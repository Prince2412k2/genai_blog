import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Blog } from '@/types/blog';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { PenSquare, LogIn, LogOut } from 'lucide-react';

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const data = await api.getBlogs();
      setBlogs(data);
    } catch (error) {
      console.error('Failed to load blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            Blog Hub
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover insights, stories, and knowledge
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {user ? (
              <>
                <Button onClick={() => navigate('/admin')} variant="default" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                  <PenSquare className="mr-2 h-5 w-5" />
                  Dashboard
                </Button>
                <Button onClick={handleSignOut} variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')} variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                <LogIn className="mr-2 h-5 w-5" />
                Admin Login
              </Button>
            )}
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <Card className="text-center py-20 bg-card/50 backdrop-blur-sm border-primary/10">
            <CardContent>
              <p className="text-xl text-muted-foreground mb-4">No blogs yet</p>
              {user && (
                <Button onClick={() => navigate('/admin/editor')}>
                  Create your first blog
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link key={blog.id} to={`/blog/${blog.id}`}>
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-primary/10 hover:border-primary/30 bg-card/50 backdrop-blur-sm group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                      </CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(blog.created_at)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm line-clamp-3 mb-4 text-muted-foreground">
                      {blog.raw?.substring(0, 150)}...
                    </div>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {blog.cost && (
                      <p className="text-xs text-muted-foreground">
                        Generation cost: ${blog.cost.toFixed(4)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
