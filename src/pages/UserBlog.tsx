import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { capitalizeFirstLetter } from '@/lib/utils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface BlogEntry {
  id: string;
  title: string;
  tags: string[];
}

const UserBlog = () => {
  const { userId } = useParams<{ userId: string }>();
  const [blogSiteTitle, setBlogSiteTitle] = useState('My Blog');
  const [blogs, setBlogs] = useState<BlogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserBlogs();
    }
  }, [userId]);

  const loadUserBlogs = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/public/blogs/${userId}.json`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Old format: just an array of blogs
          setBlogs(data);
        } else if (data && Array.isArray(data.blogs)) {
          // New format: object with title and blogs array
          setBlogSiteTitle(data.title || 'My Blog');
          setBlogs(data.blogs);
        } else if (data && Array.isArray(data.blogIds)) {
          // Older format: object with blogIds array
          setBlogSiteTitle(data.title || 'My Blog');
          setBlogs(data.blogIds.map((blog: any) => ({ ...blog, id: blog.blogId })));
        } else {
          console.error("Fetched user blog data is not in a recognized format:", data);
          setBlogs([]);
        }
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error('Failed to load user blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            {capitalizeFirstLetter(blogSiteTitle)}
          </h1>
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
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link key={blog.id || blog.blogId} to={`/blog/${blog.id || blog.blogId}/${encodeURIComponent(blog.title)}`}>
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-primary/10 hover:border-primary/30 bg-card/50 backdrop-blur-sm group">
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
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

export default UserBlog;